{ sources ? import ./sources.nix }:
import sources.nixpkgs {
  overlays = [
    (_: pkgs:
      let
        nodejs = pkgs.nodejs-12_x.overrideAttrs (oldAttrs: rec {
          version = "12.18.1";
          name = "nodejs-${version}";
          src = pkgs.fetchurl {
            url = "https://nodejs.org/dist/v${version}/node-v${version}.tar.xz";
            sha256 = "0yjwd8yilm85wkginvhhchcikjsl8g3l3qagbg0l2y1hg8f0anfa";
          };
        });
        yarn = pkgs.yarn.overrideAttrs (oldAttrs: rec {
          version = "1.22.4";
          src = pkgs.fetchzip {
            url = "https://github.com/yarnpkg/yarn/releases/download/v${version}/yarn-v${version}.tar.gz";
            sha256 = "1s054c9cmlmzy6cfkawhaxvaxhqcq0a17n4sb12p0bp2lzkax9lm";
          };
          buildInputs = [ nodejs ];
        });
        haskellPackages = pkgs.haskellPackages.override {
          overrides = self: super: {
            hakyll = pkgs.haskell.lib.appendConfigureFlag super.hakyll "-f previewserver";
            asbi-sh = self.callPackage ./asbi-sh.nix {};
          };
        };
      in {
        inherit nodejs yarn haskellPackages;
        niv = import sources.niv {};
      }
    )
  ];
  config = {};
}
