{ mkDerivation, lib, base, containers, filepath, hakyll, pandoc
, pandoc-types, regex-tdfa, text, unordered-containers, vector, yaml
}:
mkDerivation {
  pname = "asbi-sh";
  version = "0.2.0.0";
  src = null;
  isLibrary = false;
  isExecutable = true;
  executableHaskellDepends = [
    base containers filepath hakyll pandoc pandoc-types regex-tdfa text
    unordered-containers vector yaml
  ];
  description = "Website for asbi.sh";
  license = lib.licenses.bsd3;
}
