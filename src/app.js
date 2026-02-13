//create instance of server and config the server
const express=require('express');
const cookieParser=require("cookie-parser")



const app=express();

app.use(express.json()) //this will allow us to parse the json data sent by the client in the request body. we need this to get the email, name and password from the request body during registration. without this, we won't be able to access req.body and it will be undefined. this is a built-in middleware in express that parses incoming requests with JSON payloads and is based on body-parser. it makes the parsed data available under req.body property of the request object.

app.use(cookieParser()) //this will allow us to parse the cookies sent by the client in the request headers. we need this to get the token from the cookies during authentication. without this, we won't be able to access req.cookies and it will be undefined. this is a middleware that parses Cookie header and populates req.cookies with an object keyed by the cookie names. it also supports signed cookies, which are cookies that have been signed with a secret to prevent tampering.

/**
 * -- Routes required
 */
const authRouter=require("./routes/auth.routes")
const accountRouter=require("./routes/account.routes")


/**
 * -- Use Routes
 */
app.use("/api/auth",authRouter)
app.use("/api/accounts",accountRouter)


module.exports=app