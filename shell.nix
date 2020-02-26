{ pkgs ? import ./nix {} }:
pkgs.haskellPackages.shellFor {
  packages = p: [ p.asbi-sh ];
  buildInputs = [ pkgs.cabal-install pkgs.nodejs pkgs.yarn ];
}
