# Client-Side NFT Upload to IPFS

Greetings *__Emerald City Token Minters__*!

Here's a script for uploading NFT assets directly from a user's machine to NFT.Storage.

This is a standalone piece built as part of the Token Minter NFT project.  It just uses Webpack as a bundler, so there's no client-side framework (Svelte, etc).

## Test Drive:

Clone the repo into a directory, then
- *npm install*
- *npm run build*
- *node app*

(btw, I haven't tried this from scratch, so let me know if it blows up.  Yeah, I'm looking at you, Webpack!) 

Then, in a browser
- navigate to http://localhost:5000 and click "Upload Assets";
- open a file manager and navigate to your installation directory;
- drag the "assets" folder onto the drop target and it will upload.

But guess what--the assets folder in the repo has already been uploaded to IPFS, so it's not really going to do it again.

Why?  IPFS uses a "fingerprint" based on the upload contents to index stuff. (right Poindexter, the technical term is "content-addressable.") That means it creates a unique cryptographic "hash code" from the actual contents of the assets folder.
If the contents don't change, it will generate the same identical hash code. That is how the contents can be validated. But it's also why IPFS is not going to upload and store the same exact thing again.  

## Play:

If you want to play, you'll have to get your own NFT.Storage account and your own NFT.Storage Token.  Create your own NFT assets folder and away you go.

## The Assets Folder

The assets folder contains 
- image files for a collection of NFTs (usually PNG or JPEG format);
- a metadata.csv file containing the properties of each NFT, as described in the next section.

### The Metadata File

Create the metadata file in a spreadsheet like MS Word or Google Sheets.  Save as a comma-separated values (CSV) file.  Put it in your assets directory with the NFT images.

Put the property names in the first row.  Put the values for each NFT in a separate row below that.

Property names must coordinate with your NFT contract.  That means these should include:
- name
- description
- thumbnail
- filename

The program looks for attributes that reference media files found in the assets directory.  Currently it looks for attributes that:
- start with 'file', as in 'file', 'filename', etc.
- start with 'image', as in 'image', 'image_file', etc.
- contain 'thumbnail' anywhere, as in 'thumbnail', 'nft_thumbnail', etc.

### Error Handling

The program currently looks for:
- asset files that are not referenced by any NFT in the metadata file;
- metadata records that reference asset files that are NOT FOUND in the folder;
- metadata records with properties identified as asset properties that do not reference anything.

It doesn't check for attributes that it identifies as asset references but which actually are not used to reference asset files, such as 'thumbnail_width', etc.

