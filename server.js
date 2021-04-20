/* 
     By Yashwant Singh Chauhan 
     Relatas Assignment
    
 */


//------------------------------------------------------Importing Modules--------------------------------------------------------------------
const fs = require('fs').promises
const http = require('http')
const querystring = require('querystring')
const { read, openSync } = fs;
const getParams = require('./getParams')



const myFiles = require('./getAllFiles')
console.log(myFiles);
    /*

        myFiles is an array of all the files inside logFiles and sizes
        
        myFiles = [
                        {
                            name: 'example.txt',
                            size: 1511
                        },
                        {
                            name: 'example2.txt',
                            size: 5725257
                        },
                        {
                            name: 'example3.txt',
                            size: 21796
                        }
                  ]
        
        curently fileNo = 0 , it points to the first file    

    */ 


//----------------------------------------------------------Constants------------------------------------------------------------------------//
const MAX_LINES = 8
const AUTHORIZED_USERS = ['Yashwant', 'Rohit', 'Sameer']




//----------------------------------------------------------Variables------------------------------------------------------------------------//
let display_Size = 256
let req_No = 0;
let start_Pos = 0;
let fileNo = 0;
let goToNextFileNeeded = 0;

//--------------------------------------------------------Creating New Server----------------------------------------------------------------//
http.createServer((req, res) => {


    //--------------Default Values------------//
    let lines = 3;
    let command = 'normal'

    //-------------Fetching Query Params from getParams.js-------------//
    const params = getParams(req.url, req.headers.host);



    //-------------Authentication---------------------//
    if (params.user == undefined) {
        res.writeHead(401, { 'content-type': 'text/html' })
        res.write("<h1><center>!UnAuthorized! Please Provide a Query Param ?user=userID<center></h1>")
        return res.end()
    }
    else {

        const check = AUTHORIZED_USERS.find((user) => {
            return user == params.user;
        })

        if (check == undefined) {
            res.writeHead(401, { 'content-type': 'text/html' })
            res.write("<h1><center>!UnAuthorized! Please provide a valid user name<center></h1>")
            return res.end()
        }


    }



    //----------------------------Assigning argument Values -------------------------------------------------------//
    if (params.lines) {
        lines = params.lines;
    }

    if (params.command) {
        command = params.command
    }

    //-----------------------------Checking For Maximum request limit --------------------------------------------//
    if (lines > MAX_LINES) {
        res.writeHead(400, { 'content-type': 'text/html' })
        res.write(" <h3><center>Please Provide less no. of lines (Max_lines = 8)<center></h3> ")
        return res.end()
    }



    display_Size *= lines;                         // Lines to read
    let buffer = new Buffer.alloc(display_Size)    // Buffer


    //------------------------------------------------Navigating to next or back -------------------------------------------------------//
    if (command == 'next' && req_No != 0) {
        if (goToNextFileNeeded == 0) start_Pos += display_Size
    }

    if (command == 'back' && req_No != 0) {

        if (start_Pos == 0 && fileNo > 0) {
            --fileNo;
            start_Pos = myFiles[fileNo]['size']
        }

        if (start_Pos - display_Size < 0) {
            start_Pos = 0;
        }
        else {
            start_Pos = start_Pos - display_Size;
        }
    }


//---------------------------------------------------------Using fs.promises ---------------------------------------------------------------------------//






    fs.open(myFiles[fileNo]['name']).then((result) => {                                  // fspromises.open returns a filehandler


        result.read(buffer, 0, buffer.length, start_Pos).then((bytes) => {              // fspromises.read returns bytes object



            // ------------------------------------If end of file reached fileNo += 1 ---------------------------------------------------//
            if (bytes.bytesRead != buffer.length) {                                   


                res.writeHead(200, { 'content-type': 'text/plain' })                // Staus : 200 , result printed
                res.write(buffer.toString().slice(0, bytes.bytesRead))
                res.end()

                //-------------------if EOF found go to next file, reset start_pos = 0 ---------------------------------------------------//
                fileNo++;
                goToNextFileNeeded = 1;
                start_Pos = 0;
                result.close()
            }
            else {

                res.write(buffer.toString())
                goToNextFileNeeded = 0;
                res.end()
                result.close()
            }

        }).catch(err => {
            res.write('Error bro')
            res.end()                                               // Catching errors
        })
    }).catch(err => console.log(err));

    req_No += 1;
    display_Size = 256




}).listen(process.env.PORT || 5000)                                       // 5000 for Local & process.env for Hosting 
