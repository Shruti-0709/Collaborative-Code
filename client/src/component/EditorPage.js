import React, { useState } from 'react'
import Client from './Client'
import Editor from './Editor'

function EditorPage() {
    const [clients,setClient]=useState([
        {socketId : 1, username : "Shruti"},
        {socketId : 2, username : "Shreya"}
    ]);
    return (
        <div className='container-fluid vh-100'>
            <div className='row h-100'>
                <div className='col-md-2 bg-dark text-light d-flex flex-column h-100' style={{boxShadow:"2px 0px 4px rgba(0,0,0,0.1)"}}>
                <img src="/images/logo.png" 
                alt='CodeCast'
                className='img-fluid mx-auto'
                style={{maxWidth:'70px',marginTop:'10px'}}
                />
                <hr style={{marginTop:"1rem"}}/>
                {/*Client list container*/}
                <div className='d-flex flex-column overflow-auto'>
                    {clients.map((client)=>(
                        <Client key={client.socketId} username={client.username}/>
                    ))}
                </div>
                      
                {/*buttons*/}
            
                <div className='mt-auto'>
                <hr/>    
                    <button className='btn btn-success'>
                        Copy Room Id
                    </button>
                    <button className='mt-2 btn btn-danger mb-2 px-3 btn-block'>
                        Leave Room
                    </button>
                </div>
                </div>
                {/*Editor*/}
                <div className='col-md-10 text-light d-flex flex-column h-100'>
                <Editor/>
                </div>
            </div>
        </div>
    )
}

export default EditorPage
