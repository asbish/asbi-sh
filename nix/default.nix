{ sources ? import ./sources.nix }:
import sources.nixpkgs {
  overlays = [
    (_: pkgs:
      let
        nodejs = pkgs.nodejs-14_x;
        yarn = pkgs.yarn.overrideAttrs (oldAttrs: rec {
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
