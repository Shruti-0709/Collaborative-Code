import React from 'react'

function Home() {
    return (
        <div className='container-fluid'>
            <div className='row justify-content-center align-items-center min-vh-100'>
               <div className='col-12 col-md-6'>
                <div className='card shadow-sm p-2 mb-5 bg-secondary rounded'>
                    <div className='card-body text-center bg-dark'>
                        <img 
                        src='/images/logo.png'
                        className='img-fluid mx-auto d-block'
                        style={{maxWidth:"150px"}}
                        />
                        <h4 className='text-light'> Enter the Room Id</h4>
                        <div className='form-group'>
                            <input type='text'
                             className='form-control mb-2'
                              placeholder='Room Id'/>
                        </div>      
                        <div className='form-group'>
                        <input type='text'
                         className='form-control mb-2'
                         placeholder='Username'/>
                        </div>
                        <button className='btn btn-success btn-lg btn-block'>JOIN</button>
                        <p className='mt-3 text-light'>
                        Don't have a room Id?
                        <span className='text-success p-2 ' style={{cursor:"pointer"}}>New Room</span>
                        </p>
                    </div>
                </div>
               </div>
            </div>
        </div>
    )
}

export default Home
