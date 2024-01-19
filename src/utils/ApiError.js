class ApiError extends Error {
    constructor(
        statusCode,
        message="something went error",
        errors=[],
        stack=""
        )
        {
            super(message)
            this.statusCode=statusCode
            this.data = null
            this.message=message
            this.success=false;
            this.errors=errors


            //this part will remmove when we move to production . 
            // for stack-traces this below code is written .
            if(stack){
                this.stack = stack
            }
            else{
                Error.captureStackTrace(this,this.constructor)
            }
    }
}

export {ApiError}