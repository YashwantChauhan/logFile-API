/* 
     By Yashwant Singh Chauhan 
     Relatas Assignment
    
 */


//------------------------------------------------------Importing Modules--------------------------------------------------------------------
const fs = require('fs')
const http = require('http')
const querystring = require('querystring')
const {read,open} = fs;
const getParams = require('./getParams')



//----------------------------------------------------------Constants------------------------------------------------------------------------//
const MAX_LINES = 8
const AUTHORIZED_USERS = [ 'Yashwant' , 'Rohit' , 'Sameer' ]




//----------------------------------------------------------Variables------------------------------------------------------------------------//
let display_Size = 256
let req_No = 0;
let fileDescriptor;
let start_Pos = 0;




//---------------------------------------------------------Open 'Example.txt'-----------------------------------------------------------------//
open( 'example.txt' , 'r' , (error,fd)=>{
    if(error){
        console.log(error);
    }
    else{
        fileDescriptor = fd;
    }
})


//--------------------------------------------------------Creating New Server----------------------------------------------------------------//
http.createServer((req,res)=>{


        //--------------Default Values------------//
        let lines = 3; 
        let command = 'normal'

        //-------------Fetching Query Params from getParams.js-------------//
        const params = getParams(req.url,req.headers.host);



        //-------------Authentication---------------------//
        if( params.user == undefined ){
            res.writeHead(401, { 'content-type' : 'text/html' })
            res.write("<h1><center>!UnAuthorized! Please Provide a Query Param ?user=userID<center></h1>")
            return res.end()
        }
        else{

            const check = AUTHORIZED_USERS.find((user)=>{
                return user == params.user;
            })

            if( check == undefined ){
                res.writeHead(401, { 'content-type' : 'text/html' })
                res.write("<h1><center>!UnAuthorized! Please provide a valid user name<center></h1>")
                return res.end()
            }


        }



        //----------------------------Assigning argument Values -------------------------------------------------------//
        if( params.lines ){
            lines = params.lines;
        }

        if( params.command ){
            command = params.command
        }
    
        //-----------------------------Checking For Maximum request limit --------------------------------------------//
        if( lines > MAX_LINES ){
            res.writeHead(400, { 'content-type' : 'text/html' })
            res.write(" <h3><center>Please Provide less no. of lines (Max_lines = 8)<center></h3> ")
            return res.end()
        }
        

        
        display_Size *= lines;                         // Lines to read
        let buffer = new Buffer.alloc( display_Size  ) // Buffer size
        


        //------------------------------------------------Navigating to next or back -------------------------------------------------------//
        if( command == 'next' && req_No!=0 ){
            start_Pos += display_Size
        }

        if( command == 'back' && req_No!=0 ){
            if(start_Pos-display_Size<0){
                start_Pos =0;
            }
            else{
                start_Pos = start_Pos-display_Size;
            }
        }

        

        //-------------------------------------------------------Reading from 'example.txt'---------------------------------------------------//
        new Promise((resolve,reject)=>{

            read( fileDescriptor, buffer , 0, buffer.length , start_Pos , (error,bytes)=>{
                if(error){
                    reject(error);
                }
                else{
                    if(bytes>0){
                        resolve(buffer.toString())
                    }
                }
            })
            
        }).then(result=>{
            res.writeHead(200, { 'content-type' : 'text/plain' })                // Staus : 200 , result printed
            res.write(result)                                       
            return res.end()
        }).catch(error=>{
            console.log(error);                                                  // Catching errors
        })
    
        req_No += 1; 
        display_Size = 256




}).listen( process.env.PORT || 5000 )                                       // 5000 for Local & process.env for Hosting 
