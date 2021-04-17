{-# LANGUAGE NamedFieldPuns    #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TupleSections     #-}

import           Control.Applicative (empty, liftA2)
import           Control.Monad       (forM_)
import qualified Data.HashMap.Strict as HMap
import           Data.Map.Strict     (Map)
import qualified Data.Map.Strict     as Map
import           Data.Maybe          (fromMaybe, mapMaybe)
import           Data.Text           (Text)
import qualified Data.Text           as T
import qualified Data.Vector         as V
import qualified Data.Yaml           as Yaml
import           System.Environment  (lookupEnv)
import           System.FilePath     (replaceExtension)
import           Text.Pandoc         (Pandoc (..))
import qualified Text.Pandoc         as Pandoc
import           Text.Pandoc.Walk    (walk)
import           Text.Regex.TDFA     (getAllTextSubmatches, (=~))

import           Hakyll


--------------------------------------------------------------------------------
main :: IO ()
main = hakyllWith config $ do
    hostname <- preprocess $
        fromMaybe "https://www.asbi.sh" <$> lookupEnv "SITE_HOST"


    match "templates/*" $ compile templateBodyCompiler

    match "static/**" $ do
        route $ gsubRoute "static/" (const "")
        compile copyFileCompiler


    -- | Common
    match "common/dist/404*" $
        compile $ getResourceString >>= saveSnapshot "404Inlines"

    create ["404.html"] $ do
        route idRoute
        compile $ do
            let ctx = snapshotBodyField
                        "css" "common/dist/404.css" "404Inlines"
                    <> snapshotBodyField
                        "img" "common/dist/404.base64" "404Inlines"
                    <> constField "home" (hostname ++ "/")
                    <> defaultContext
            makeItem ("" :: String)
                >>= loadAndApplyTemplate "templates/404.html" ctx
                >>= relativizeUrlsNoIndex

    forM_ [ "common/dist/global*"
          , "common/dist/blog*"
          , "common/dist/sw*"
          ] $ \x ->
        match x $ do
            route $ gsubRoute "common/dist/" (const "")
            compile copyFileCompiler

    commonAssetsUrlContext <- mkUrlContext
      [ ("global-js", "common/dist/global*.js")
      , ("global-css", "common/dist/global*.css")
      , ("blog-js", "common/dist/blog*.js")
      , ("blog-css", "common/dist/blog*.css")
      ]


    -- | Entries
    blogEntries <- mkEntries blogIndexes (Just . blogPath) recentFirst
    pageEntries <- mkEntries pageIndexes pagePath recentFirst


    -- | Blog
    tags <- buildTags blogIndexes (fromCapture "blog/tags/*.html")

    match blogImages $ do
        route idRoute
        compile copyFileCompiler

    match blogIndexes $ do
        route $ entryRoute blogEntries
        compile $ do
            idt <- getUnderlying
            let ctx = boolField "blog" (const True)
                    <> dateField'
                    <> tagsField "tags" tags
                    <> locField hostname
                    <> entriesField "blog-entries" blogEntries idt
                    <> entriesField "page-entries" pageEntries idt
                    <> commonAssetsUrlContext
                    <> defaultContext
            (fmap demoteHeaders <$> pandocCompilerWithTransform
                                    defaultHakyllReaderOptions
                                    defaultHakyllWriterOptions
                                    pandocTransformLazyImage)
                >>= loadAndApplyTemplate "templates/blog-layout.html" ctx
                >>= loadAndApplyTemplate "templates/layout.html" ctx
                >>= relativizeUrlsNoIndex

    tagsRules tags $ \tag pat -> do
        route idRoute
        compile $ do
            posts <- recentFirst =<< loadAll pat
            idt <- getUnderlying
            let ctx = constField "title" ("Tag: " ++ tag)
                    <> locField hostname
                    <> archiveField posts
                    <> entriesField "blog-entries" blogEntries idt
                    <> entriesField "page-entries" pageEntries idt
                    <> commonAssetsUrlContext
                    <> defaultContext
            makeItem ""
                >>= loadAndApplyTemplate "templates/archive-layout.html" ctx
                >>= loadAndApplyTemplate "templates/layout.html" ctx
                >>= relativizeUrlsNoIndex


    -- TODO: Blog archive


    -- | Page
    match pageAssets $ do
        route $ customRoute (fromMaybe "" . pagePath)
        compile copyFileCompiler

    match pageInlines $
        compile $ getResourceString >>= saveSnapshot "pageInlines"

    match pageIndexes $ do
        route $ entryRoute pageEntries
        compile $ do
            idt <- getUnderlying
            meta <- getMetadata idt
            let ctx = locField hostname
                    <> includeContext meta idt "pageInlines"
                    <> entriesField "blog-entries" blogEntries idt
                    <> entriesField "page-entries" pageEntries idt
                    <> commonAssetsUrlContext
                    <> defaultContext
            getResourceBody
                >>= loadAndApplyTemplate "templates/layout.html" ctx
                >>= relativizeUrlsNoIndex


    -- TODO: Page archive


    -- | Sitemap
    create ["sitemap.xml"] $ do
        route idRoute
        compile $ do
            let entries = order $ blogEntries <> pageEntries
                entriesCtx = locField hostname
                           <> modificationTimeField "lastmod" "%Y-%m-%d"
                           <> metadataField
                ctx = listField "entries" entriesCtx $ return entries

            makeItem ("" :: String)
                >>= loadAndApplyTemplate "templates/sitemap.xml" ctx


--------------------------------------------------------------------------------
data Entries = Entries { paths :: Map Identifier FilePath
                       , order :: [Item String]
                       } deriving (Show)

instance Semigroup Entries where
    (<>) a b = Entries { paths = paths a <> paths b
                       , order = order a <> order b
                       }

mkEntries :: MonadMetadata m
          => Pattern
          -> (Identifier -> Maybe FilePath)
          -> ([Item String] -> m [Item String])
          -> m Entries
mkEntries pat path sort = do
    idts <- mapMaybe f <$> getMatches pat
    order <- sort [Item i "" | (i, _) <- idts]
    return $ Entries { paths = Map.fromList idts
                     , order = order
                     }
  where
    f :: Identifier -> Maybe (Identifier, FilePath)
    f idt = path idt >>= Just . (idt,)


entryRoute :: Entries -> Routes
entryRoute indices
    = matchRoute (complement $ fromRegex "^$")
    $ customRoute (\idt -> fromMaybe "" $ Map.lookup idt (paths indices))


mkUrlContext :: MonadMetadata m => [(String, Pattern)] -> m (Context String)
mkUrlContext = foldr (liftA2 mappend . getField) (pure mempty)
  where
    getField :: MonadMetadata m => (String, Pattern) -> m (Context String)
    getField (k, glob) = field' k <$> getMatches glob

    field' k (idt:_) = field k (\_ -> maybe (fail' idt) toUrl <$> getRoute idt)
    field' _ [] = mempty
    fail' idt = fail $ "No route url found " ++ toFilePath idt


--------------------------------------------------------------------------------
blogIndexes, blogImages :: Pattern
blogIndexes = fromGlob "blog/*.md"
blogImages = fromGlob "blog/images/*"


blogPath :: Identifier -> FilePath
blogPath = (`replaceExtension` ".html") . toFilePath


--------------------------------------------------------------------------------
pageIndexes, pageInlines, pageAssets :: Pattern
pageIndexes = fromGlob "page/*/dist/index.html"
pageInlines = fromGlob "page/*/dist/inline/**"
pageAssets = fromGlob "page/*/dist/**"
           .&&. complement pageIndexes
           .&&. complement pageInlines


pagePath :: Identifier -> Maybe FilePath
pagePath idt = case getAllTextSubmatches (path =~ reg) of
    [_, dir, name] | dir == "home" -> Just name
                   | otherwise     -> Just $ dir ++ "/" ++ name
    _                              -> Nothing
  where
    path = toFilePath idt
    reg = "^page/([a-z0-9_-]+)/dist/(.*)$" :: String


--------------------------------------------------------------------------------
-- Complete URL
dateField' :: Context String
dateField' = dateField "date" "%B %e, %Y"


locField :: String -> Context String
locField origin = mapContext ((origin++) . replaceIdx) $ urlField "loc"


snapshotBodyField :: String -> FilePath -> Snapshot -> Context String
snapshotBodyField k path snap = field k body
  where
    body = const $ loadSnapshotBody (fromFilePath path) snap


archiveField :: [Item String] -> Context String
archiveField items = listField "archive-items" ctx (return items)
  where
    ctx = dateField' <> defaultContext


entriesField :: String -> Entries -> Identifier -> Context String
entriesField _ Entries { order = [] } _ = mempty
entriesField k Entries { order } idt = listField k ctx $ return $ take 5 order
  where
    ctx = boolField "current" ((idt==) . itemIdentifier)
        <> metadataField
        <> defaultContext


-- Page specific JS/CSS
includeContext :: Metadata -> Identifier -> Snapshot -> Context String
includeContext meta idt inlineSnap
    = ref "styles" <> ref "scripts"
    <> inline "inline-styles" "style-body" "*.css"
    <> inline "inline-scripts" "script-body" "*.js"
  where
    ref :: String -> Context String
    ref k = case lookupObjectList k meta of
        Just v  -> listField k refAttrs $ traverse makeItem v
        Nothing -> mempty

    refAttrs :: Context (HMap.HashMap Text Text)
    refAttrs = Context $ \k _ i -> case HMap.lookup (T.pack k) (itemBody i) of
        Just x  -> return $ StringField $ T.unpack x
        Nothing -> empty

    inline :: String -> String -> String -> Context String
    inline k k' s = listField k (field k' $ return . itemBody) $ inlineItems s

    inlineItems :: String -> Compiler [Item String]
    inlineItems s = loadAllSnapshots (fromGlob $ inlineDir ++ s) inlineSnap
    inlineDir = replaceIdx (toFilePath idt) ++ "inline/"


--------------------------------------------------------------------------------
lookupObjectList :: String -> Metadata -> Maybe [HMap.HashMap Text Text]
lookupObjectList k meta = HMap.lookup (T.pack k) meta >>= toList
  where
    toList (Yaml.Array x) = traverse toObject (V.toList x)
    toList _              = Nothing
    toObject (Yaml.Object x) = traverse toString x
    toObject _               = Nothing
    toString (Yaml.String t)   = Just t
    toString (Yaml.Bool True)  = Just "true"
    toString (Yaml.Bool False) = Just "false"
    toString _                 = Nothing


-- For common/src/blog/lazy-image.ts
-- Additional attributes are `data-max-width` (for `lazy-image-inner`) and
-- `data-height-ratio` (for `lazy-image-container`)
--
-- # Examples
--
-- # from:
-- ![foo](./images/foo.png){data-max-width="500px" data-height-ratio="72.5%" }
--
-- # to:
-- <span class="lazy-image" data-src="./images/foo.png" data-alt="foo">
--   <span class="lazy-image-inner" style="max-width:500px">
--     <span class="lazy-image-container" style="padding-bottom:72.5%"></span>
--   </span>
-- </span>
--
pandocTransformLazyImage :: Pandoc -> Pandoc
pandocTransformLazyImage (Pandoc meta block) = Pandoc meta $ walk f block
  where
    f (Pandoc.Image (idt, classes, kv) xs (url, _)) =
      let (ctnr, kv') = child "data-height-ratio" kv "padding-bottom"
                                ["lazy-image-container"] []
          (inner, kv'') = child "data-max-width" kv' "max-width"
                                  ["lazy-image-inner"] ctnr
      in Pandoc.Span (idt
                     , classes ++ ["lazy-image"]
                     , kv'' ++ [ ("data-src", url)
                               , ("data-alt", T.concat $ toText <$> xs)
                               ]
                     ) inner
    f x = x

    child :: Text -- key
          -> [(Text, Text)] -- attribute assocs
          -> Text -- CSS style property name
          -> [Text] -- CSS classes
          -> [Pandoc.Inline] -- children
          -> ([Pandoc.Inline], [(Text, Text)])
    child k kv propName classNames children =
        let (v, kv') = lookupThenDelete k kv []
            toStyle x = ("style", propName <> ":" <> x)
        in ([Pandoc.Span ("", classNames, toStyle <$> v) children], kv')

    lookupThenDelete :: Text -- key
                     -> [(Text, Text)] -- rest assocs
                     -> [(Text, Text)] -- past assocs
                     -> ([Text], [(Text, Text)])
    lookupThenDelete _ [] past = ([], past)
    lookupThenDelete k (xy@(x,y):xys) past
        | k == x    = ([y], past ++ xys)
        | otherwise = lookupThenDelete k xys (xy:past)

    toText (Pandoc.Str x) = x
    toText Pandoc.Space   = " "
    toText _              = ""


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
config = defaultConfiguration { previewHost = "0.0.0.0"
                              , previewPort = 3000
                              , inMemoryCache = True
                              }
