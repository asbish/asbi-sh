{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TupleSections     #-}

import           Control.Applicative (empty)
import           Control.Monad       (forM_)
import qualified Data.HashMap.Strict as HMap
import           Data.Map.Strict     (Map)
import qualified Data.Map.Strict     as Map
import           Data.Maybe          (fromMaybe)
import           Data.Monoid         (mempty, (<>))
import qualified Data.Text           as T
import qualified Data.Vector         as V
import qualified Data.Yaml           as Yml
import           System.Environment  (lookupEnv)
import           Text.Regex.TDFA     (getAllTextSubmatches, (=~))

import           Hakyll

------------------------------------------------------------------------------
main :: IO ()
main = hakyll $ do
    forM_ [ "static/art/*", "static/css/*", "static/js/*" ] $ \x ->
        match x $ do
            route $ gsubRoute "static/" (const "")
            compile copyFileCompiler


    match "static/favicon.ico" $ do
        route $ constRoute "favicon.ico"
        compile copyFileCompiler


    match "static/robots.txt" $ do
        route $ constRoute "robots.txt"
        compile copyFileCompiler


    matchMetadata "content/*/dist/**" HMap.null $ do
        route $ customRoute $ contentsPath . toFilePath
        compile copyFileCompiler


    host <- preprocess $
        fromMaybe "https://www.asbi.sh" <$> lookupEnv "SITE_HOST"


    contents@(ctMap, _) <- mkContents "content/*/dist/index.html"


    match "content/*/dist/index.html" $ do
        route $ customRoute $ (Map.!) ctMap
        compile $ do
            idt <- getUnderlying
            meta <- getMetadata idt
            let ctx = includeCtx meta
                    <> contentsCtx contents idt
                    <> locationCtx ctMap host
                    <> defaultContext
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= relativizeUrlsNoIndex


    match "content/index.html" $ do
        route $ constRoute "index.html"
        compile $ do
            idt <- getUnderlying
            let ctx = contentsCtx contents idt
                    <> constField "loc" host
                    <> defaultContext
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= relativizeUrlsNoIndex


    match "static/inline/404.css" $ compile compressCssCompiler
    create ["404.html"] $ do
        route idRoute
        compile $ do
            let ctx = field "css" (const $ loadBody "static/inline/404.css")
            makeItem ("" :: String)
                >>= loadAndApplyTemplate "templates/404.html" ctx
                >>= relativizeUrlsNoIndex


    create ["sitemap.xml"] $ do
        route idRoute
        compile $ do
            let ctx = sitemapCtx contents host
            makeItem ("" :: String)
                >>= loadAndApplyTemplate "templates/sitemap.xml" ctx


    match "templates/*" $ compile templateBodyCompiler

------------------------------------------------------------------------------
type Contents = (Map Identifier String, [Item String])


-- TODO: need more efficient fix
mkContents :: MonadMetadata m => Pattern -> m Contents
mkContents pat = do
    idts <- getMatches pat
    (Map.fromList (asc <$> idts), ) <$> recentFirst [Item i "" | i <- idts]
  where
    asc idt = (idt, contentsPath (toFilePath idt))


-- TODO: windows sep
contentsPath :: FilePath -> String
contentsPath path = case matches' of
    [_, dir, staticdir, name] | staticdir == "" -> dir ++ name
                              | otherwise       -> staticdir ++ name
    _                         -> fail "contentsPath: can't resolve path."
  where
    matches' = getAllTextSubmatches $ path =~ pat :: [String]
    pat = "^content/([a-z0-9_-]+/)dist/(art/|css/|fonts/|js/)?(.*)" :: String


contentsCtx :: Contents -> Identifier -> Context String
contentsCtx (_, []) _ = mempty
contentsCtx (ctMap, ctItems) idt = listField "contents" ctx $ return ctItems
  where
    ctx = field "url" url <> metadataField
    url item = let idt' = itemIdentifier item
               in if idt' == idt
                   then empty
                   else return $ maybe empty ("/"++) $ Map.lookup idt' ctMap


-- TODO: inline style
includeCtx :: Metadata -> Context String
includeCtx meta = mkCtx "styles" "style" <> mkCtx "scripts" "script"
  where
    has (Yml.String v) = Just [T.unpack v]
    has (Yml.Array v)  = fmap concat $ sequence $ has <$> V.toList v
    has _              = Nothing

    mkItems :: [String] -> Compiler [Item String]
    mkItems = traverse makeItem

    mkCtx :: String -> String -> Context String
    mkCtx k k' = case has =<< HMap.lookup (T.pack k) meta of
        Nothing -> mempty
        Just v  -> listField k (field k' (return . itemBody)) $ mkItems v


sitemapCtx :: Contents -> String -> Context String
sitemapCtx (ctMap, ctItems) host = listField "contents" ctx $ return ctItems'
  where
    ctx = locationCtx ctMap' host
        <> metadataField
        <> dateField "lastmod" "%Y-%m-%d"

    -- Cons contents/index.html
    idxIdent = fromFilePath "content/index.html"
    idxPath = "index.html"
    ctMap' = Map.insert idxIdent idxPath ctMap
    ctItems' = Item idxIdent "" : ctItems


locationCtx :: Map Identifier String -> String -> Context String
locationCtx ctMap host = field "loc" loc
  where
    loc = return . replaceIdx . (host++) . ("/"++)
        . (Map.!) ctMap . itemIdentifier


relativizeUrlsNoIndex :: Item String -> Compiler (Item String)
relativizeUrlsNoIndex item = do
    r <- getRoute $ itemIdentifier item
    return $ case r of
        Nothing -> item
        Just r' -> replaceIdx . relativizeUrlsWith (toSiteRoot r') <$> item


replaceIdx :: String -> String
replaceIdx = replaceAll "/index.html" (const "/")
