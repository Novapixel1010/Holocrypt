# Holocrypt

A simple and secure online client-side Age key generator, encryption and decryption tool built using wasm

View online [here]()

## Building

You will need:

- [Go](https://go.dev/) and `wasm_exec.js` (included with Go)
- [PNPM](https://pnpm.io/)
- [Make] Might need to install make `sudo apt install make`

Make sure to copy `wasm_exec.js` to `vendor` you need to make the vendor directory too.

```shell
mkdir vendor
cp /usr/local/go/misc/wasm/wasm_exec.js ~/Holocrypt/vendor/
```
Now install first then build

```shell
pnpm install
make build
```

The final static website will be placed in `dist/`

## Usage

Put the contents of `dist` folder on your favorite web server server or open `index.html`.
There is no binary to run 😄

For example I use `rsync` to copy to my web folder

```shell
sudo rsync -a --delete dist/ /var/www/Holocrypt/
```
* `-a`: archive mode (preserves timestamps, permissions, etc.)

* `--delete`: removes files from `/var/www/Holocrypt/` that no longer exist in `dist/`

## Developement

You can run a developement Vite server with live-reload using `pnpm run dev` (this will not auto-rebuild the WASM).

Please format the source files before commiting with `pnpm run format`

## License

This project is licensed under the Apache 2.0 with Commons Clause and Anti Tampering Clause. See the LICENSE file for the full license text.
