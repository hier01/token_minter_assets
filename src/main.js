import Papa from 'papaparse'  // CSV parser
import { packToBlob } from 'ipfs-car/pack/blob'
import { unpack } from 'ipfs-car/unpack'
import { MemoryBlockStore } from 'ipfs-car/blockstore/memory'
//import { TreewalkCarSplitter } from 'carbites/treewalk'

//import * as fcl from '@onflow/fcl';
/*
async function hello_from_flow(){
	fcl.config().put("accessNode.api", "https://access-testnet.onflow.org");
	let msg = await fcl.query({
		cadence: `pub fun main(): String { return "Hello from Flow!"; }`
	});
	return msg;
}
*/
const OK = 1; // indicates image file found or not

function error(e) {
    console.log('error');
    console.log(e);
}

function error_from_readentries(e) {
    console.log('error_from_readentries');
    console.log(e);
}

async function processItems( entry, path, metadata ){
    if( entry.kind === 'file' ){
      const file = await entry.getFile();
      if( file !== null ){
          if( file.name.match(/^meta.*\.csv$/ ) ){
              metadata = await readMetadataFile( path, file, metadata )
          } else {
              metadata.nft_data[ file.name ] = metadata.nft_data[ file.name ] || { };
              metadata.nft_data[ file.name ].status = OK;
              metadata.nft_data[ file.name ].content = file; //await readImageFile( path, file );
          }
      }
    } else if( entry.kind === 'directory' ){
      for await (const handle of entry.values()) {  
          metadata = await processItems( handle, 'assets', metadata );
      }
    }
    return metadata;
}

async function readMetadataFile( path, file, metadata ){

    return new Promise( (resolve, reject)=>{ 
        let reader = new FileReader();
        reader.onload = function( e ) {
            let text = e.target.result;
            let pt = Papa.parse( text );
            metadata.attributes = pt.data[0];
            metadata.nft_data = pt.data.slice(1).reduce( (a,f)=>{
              if( f && f.length > 0 && f[0] !== '' ){
                  let nft_attribs = {};
                  let key = null;
                  for( let i=0; i < metadata.attributes.length; i++ ){
                    nft_attribs[ metadata.attributes[i] ] = f[ i ];
                    if( metadata.attributes[i].toLowerCase().match(/^file/ ) ){
                      metadata.key = metadata.attributes[i]; // which attribute in metadata file contains the image file name
                      key = f[ i ];
                    }
                  }
                  if( !key ){ 
                    console.log( 'nft metadata requires a filename! f='+JSON.stringify(f) ); 
                  } else if( metadata.nft_data[ key ] ){
                    a[ key ] = { ...{ data: nft_attribs }, ...metadata.nft_data[key] }
                  } else {
                    a[ key ] = { data: nft_attribs, status: 0 };
                  }
              }
              return a;
            }, { } );
            resolve();
        }
        reader.readAsText( file );
    })
    .then( ()=>{ 
        return metadata; 
    } )
    .catch( (e)=>{
        console.log( 'ERROR: '+e );
        return metadata;
    })

}

/*
async function readImageFile( path, file, metadata ){

    return new Promise( (resolve, reject)=>{ 
        let reader = new FileReader();
        reader.onload = function( e ) {
            let img_data = e.target.result;
            resolve( img_data );
        }
        reader.readAsArrayBuffer( file );
    })
    .then( ( img_data )=>{ 
        return img_data; 
    } )
    .catch( (e)=>{
        console.log( 'ERROR: '+e );
    })

}
*/
/*
async function splitCars() {
  const largeCar = await loadLargeCar()
  const targetSize = 100000000
  const splitter = new TreewalkCarSplitter(largeCar, targetSize)
  for await (const smallCar of splitter.cars()) {
    // Each small car is an AsyncIterable<Uint8Array> of CAR data
    for await (const chunk of smallCar) {
      // Do something with the car data...
      // For example, you could upload it to the NFT.storage HTTP API
      // https://nft.storage/api-docs
    }
    // You can also get the root CID of each small CAR with the getRoots method:
    const roots = await smallCar.getRoots()
    console.log('root cids', roots)
    // Since we're using TreewalkCarSpliter, all the smaller CARs should have the
    // same root CID as the large input CAR.
  }
}
*/

async function handleAssetFolderDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    //---- asset directory dropped: find and parse metadata file, set status on image files
    var metadata = { attributes:[], nft_data:{} };

    for( const item of e.dataTransfer.items ) {
        if (item.kind === 'file') {  // kind will be 'file' for file/directory
            const fshandle = await item.getAsFileSystemHandle();
            let md = await processItems( fshandle, null, metadata );
            metadata = md || metadata;
        }
    }

    //---- check for errors in metadata: a) files w/ no metadata or b) metadata w/ no file
    let car_files = [];
    for( const key in metadata.nft_data ){
        let item = metadata.nft_data[ key ]
        console.log('pack '+ item.data[ metadata.key ] );
        if( item.content ){
//           let file = new File([ item.content ], item.data[ metadata.key ], {type:"image/png", lastModified:new Date().getTime()})
           car_files.push( item.content ); //file );
        }
    }

    //---- build .car file
    const { root, car } = await packToBlob({
      input: car_files,
      blockstore: new MemoryBlockStore()
    })
    console.log( 'root= '+root+' car= '+car )

    //---- upload to IPFS

}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

function make_div() {
  const div = document.createElement('div');
  let htm = `<p>Drop assets folder here.  Include "metadata.csv" and NFT image files</p><div id='drop_zone' class='dropDiv' style='border: 1px solid; height: 200px; width: 50%; background-color: powderblue;'></div>`;
//  let flowhello = await hello_from_flow();
//  htm += `<p>${ flowhello }</p>`;
  div.innerHTML = htm;
  document.body.appendChild( div );
  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleAssetFolderDrop, false);
}

make_div();
