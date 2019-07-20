{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE NamedFieldPuns    #-}

import           Control.Applicative (empty)
import           Data.Map.Strict     (Map)
import qualified Data.Map.Strict     as Map
import           Data.Maybe          (fromMaybe)
import           Data.Monoid         (mempty, (<>))
import           System.Environment  (lookupEnv)
import           Text.Regex.TDFA     (getAllTextSubmatches, (=~))

import           Hakyll


--------------------------------------------------------------------------------
main :: IO ()
main = hakyllWith config $ do
    production <- preprocess $
        (== Just "production") <$> lookupEnv "SITE_ENV"

    hostname <- preprocess $
        fromMaybe "https://www.asbi.sh" <$> lookupEnv "SITE_HOST"


    match "templates/*" $ compile templateBodyCompiler


    -- | Grobal assets
    match "contents/global/dist/**" $ do
        route $ gsubRoute "contents/global/dist/" (const "")
        compile copyFileCompiler


    -- | 404
    match "contents/404/dist/*" $
        compile $ getResourceString >>= saveSnapshot "404-inlines"

    create ["404.html"] $ do
        route idRoute
        compile $ do
            let ctx = boolField "production" (const production)
                    <> inlineContext
                         "css" "contents/404/dist/inline.css" "404-inlines"
                    <> inlineContext
                         "img" "contents/404/dist/img.base64" "404-inlines"
                    <> defaultContext
            makeItem ("" :: String)
                >>= loadAndApplyTemplate "templates/404.html" ctx
                >>= relativizeUrlsNoIndex


    -- | Page contents
    pageIndices <- mkPageIndices

    match pageAssetsPattern $ do
        route pageRoute
        compile copyFileCompiler

    match pageInlinePattern $
        compile $ getResourceString >>= saveSnapshot "page-inlines"

    match pageIndexPattern $ do
        route $ pageRouteWith $ paths pageIndices
        compile $ do
            idt <- getUnderlying
            meta <- getMetadata idt
            let ctx = boolField "production" (const production)
                    <> linkContext "page_contents" pageIndices idt
                    <> absUrlContext "abs_url" pageIndices hostname
                    <> pageIncludeContext meta idt "page-inlines"
                    <> defaultContext
            getResourceBody
                >>= loadAndApplyTemplate "templates/layout.html" ctx
                >>= relativizeUrlsNoIndex


    -- | Sitemap
    create ["sitemap.xml"] $ do
        route idRoute
        compile $ do
            let pages = absUrlContext "loc" pageIndices hostname
                      <> dateField "lastmod" "%Y-%m-%d"
                      <> metadataField
                ctx = listField "pages" pages $ return (order pageIndices)
            makeItem ("" :: String)
                >>= loadAndApplyTemplate "templates/sitemap.xml" ctx


--------------------------------------------------------------------------------
data ContentIndices = ContentIndices
    { paths :: Map Identifier FilePath
    , order :: [Item String]
    } deriving (Show)


--------------------------------------------------------------------------------
pageIndexPattern, pageAssetsPattern, pageInlinePattern :: Pattern
pageIndexPattern = "contents/pages/*/dist/index.html"
pageInlinePattern = "contents/pages/*/dist/inline/**"
pageAssetsPattern = "contents/pages/*/dist/**"
                  .&&. complement pageInlinePattern
                  .&&. complement pageIndexPattern


mkPageIndices :: MonadMetadata m => m ContentIndices
mkPageIndices = do
    idts <- getMatches pageIndexPattern
    order <- recentFirst [Item i "" | i <- idts]
    return $ ContentIndices
        { paths = Map.fromList $ (\idt -> (idt, pagePath idt)) <$> idts
        , order = order
        }


pagePath :: Identifier -> FilePath
pagePath idt = case getAllTextSubmatches (path =~ reg) of
    [_, dir, name] | dir == "home" -> name
                   | otherwise     -> dir ++ "/" ++ name
    _                              -> "_"
  where
    path = toFilePath idt
    reg = "^contents/pages/([a-z0-9_-]+)/dist/(.*)$" :: String


pageRoute :: Routes
pageRoute = pageRouteWith Map.empty


pageRouteWith :: Map Identifier FilePath -> Routes
pageRouteWith m = matchRoute (complement $ fromRegex "^_$") $ customRoute f
  where
    f idt = fromMaybe (pagePath idt) (Map.lookup idt m)


-- | Page specific JS/CSS
pageIncludeContext :: Metadata -> Identifier -> Snapshot -> Context String
pageIncludeContext meta idt inlineSnap =
    file "styles" "style"
    <> file "scripts" "script"
    <> inline "inline_styles" "style" "*.css"
    <> inline "inline_scripts" "script" "*.js"
  where
    file k k' = case lookupStringList k meta of
        Nothing -> mempty
        Just v  -> listField k (field k' (return . itemBody))
                     $ traverse makeItem v

    inline k k' s = listField k (field k' $ return . itemBody) $ inlineItems s
    inlineDir = replaceIdx (toFilePath idt) ++ "inline/"
    inlineItems :: String -> Compiler [Item String]
    inlineItems s = loadAllSnapshots (fromGlob $ inlineDir ++ s) inlineSnap


--------------------------------------------------------------------------------
linkContext :: String -> ContentIndices -> Identifier -> Context String
linkContext _ ContentIndices { order = [] } _ = mempty
linkContext k ContentIndices { paths, order } idt =
    listField k ctx $ return order
  where
    ctx = field "link" url <> metadataField
    url item = let idt' = itemIdentifier item
               in if idt' == idt
                   then empty
                   else return $ maybe empty ("/"++) $ Map.lookup idt' paths


-- | Complete/Absolute URL
absUrlContext :: String -> ContentIndices -> String -> Context String
absUrlContext _ ContentIndices { order = [] } _ = mempty
absUrlContext k ContentIndices { paths } origin =
    field k $ return . url
  where
    url = (origin++) . replaceIdx . ("/"++) . (Map.!) paths . itemIdentifier


inlineContext :: String -> FilePath -> Snapshot -> Context String
inlineContext k path snap = field k body
  where
    body = const $ loadSnapshotBody (fromFilePath path) snap


--------------------------------------------------------------------------------
relativizeUrlsNoIndex :: Item String -> Compiler (Item String)
relativizeUrlsNoIndex item = do
    r <- getRoute $ itemIdentifier item
    return $ case r of
        Nothing -> item
        Just r' -> replaceIdx . relativizeUrlsWith (toSiteRoot r') <$> item


replaceIdx :: String -> String
replaceIdx = replaceAll "/index.html" (const "/")


--------------------------------------------------------------------------------
config :: Configuration
config = defaultConfiguration
    { previewPort = 3000
    }
