{ sources ? import ./sources.nix }:
import sources.nixpkgs {
  overlays = [
    (_: pkgs:
      let
        nodejs = pkgs.nodejs-14_x.overrideAttrs (oldAttrs: rec {
          version = "14.15.1";
          name = "nodejs-${version}";
          src = pkgs.fetchurl {
            url = "https://nodejs.org/dist/v${version}/node-v${version}.tar.xz";
            sha256 = "1g61vqsgq3jsipw2fckj68i4a4pi1iz1kbw7mlw8jmzp8rl46q81";
          };
        });
        yarn = pkgs.yarn.overrideAttrs (oldAttrs: rec {
          version = "1.22.10";
          src = pkgs.fetchurl {
            url = "https://registry.npmjs.org/yarn/-/yarn-${version}.tgz";
            sha512 = "IanQGI9RRPAN87VGTF7zs2uxkSyQSrSPsju0COgbsKQOOXr5LtcVPeyXWgwVa0ywG3d8dg6kSYKGBuYK021qeA==";
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
