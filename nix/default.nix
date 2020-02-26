{ sources ? import ./sources.nix }:
import sources.nixpkgs {
  overlays = [
    (_: pkgs:
      let
        nodejs = pkgs.nodejs-12_x.overrideAttrs (oldAttrs: rec {
          version = "12.16.1";
          name = "nodejs-${version}";
          src = pkgs.fetchurl {
            url = "https://nodejs.org/dist/v${version}/node-v${version}.tar.xz";
            sha256 = "0ba1dla31z6i31z3723l74nky1v04irwbl3iaqmi0iicl1dq958a";
          };
        });
        yarn = pkgs.yarn.overrideAttrs (oldAttrs: rec {
          version = "1.22.0";
          src = pkgs.fetchzip {
            url = "https://github.com/yarnpkg/yarn/releases/download/v${version}/yarn-v${version}.tar.gz";
            sha256 = "0hbsdbrqx5xhr171ik862v51xwjzbfncic92pgbnhnlmxy2y974x";
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
