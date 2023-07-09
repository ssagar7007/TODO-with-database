const express = require("express")
const fs = require("fs")
const session = require('express-session')
const multer = require('multer')

const startDb = require("./database/init");
const userModel = require("./database/models/user");
const todoModel = require("./database/models/todo");

startDb();

const app = express();


app.use(express.static("public"));
app.use( express.static("uploads") );
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const upload = multer({ dest: "uploads" });

app.set('view engine', 'ejs');
app.set("views","./views");

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
	
}))

app.get("/", Home);

app.get("/username",function(req,res)
{  
   res.send(req.session.username);
});

app.route("/todo").get(GetTodo).post(upload.single("taskPic"),PostTodo);

app.route("/logout").get(function(req,res)
{
  res.redirect("/login");
})
.post(function (req, res)
{
	req.session.destroy();
	res.redirect("/login");
	
});

app.listen(3000, function()
{
	console.log("server is live")
})

app.route("/login").get(function (req, res) {
	// res.sendFile(__dirname + "/public/html/login.html");
	res.render("login",{error : ""})
})
.post(function (req, res) {
	getUser(req.body.username,  req.body.password, function( err, user )
	{
		if(user.length)
		{
			req.session.isLoggedIn = true;
			// req.session.username = user[0].username;
			req.session.currentuser = user[0];
			
			res.redirect("/")
		}
		else
		{
			res.render("login",{ error:"Incorrect username or password" });

		}
	});
});

app.route("/signup").get(function (req, res)
{
	// res.sendFile(__dirname+"/public/html/signup.html");
	res.render("signup",{error : ""})
})
.post(upload.single("profilePic"), function (req, res)
{
	

	 //check if user already fs.exists......
	 userModel.find({ username: req.body.username})
	 .then(function(data)
	 {
		 if (data.length)
		{
			//  res.redirect("/signup");
		   res.render("signup",{error : "Username already exists"})  
		}
		 else
		{
			const user = {
				username: req.body.username,
				password: req.body.password,
				profilePic: req.file.filename
			 } 
			 saveUser(user, function (err)
			 {
				 if (err)
				 {
					 res.end(err);
				 }
				 else
				 {
					 res.redirect("/login");	
				 }
			 })

		 }
		
		
		 
	 })
	 .catch(function(err)
	 {
	    console.log("Error occured in signup");
		
	 })
	

})


function Home(req, res)
{   

	if (req.session.isLoggedIn)
	{   
		getTodos(function(err, todos)
		{
			
			const userTodos = todos.filter(function(todo)
			{
				return todo.createdBy === req.session.currentuser.username
			})

			res.render("index", {  data: userTodos, 
				user : req.session.currentuser
			});
		})
		
	}
	else
	{
	res.redirect("/login");
	}
	
}

function GetTodo(req, res)
{   
	getTodos(function(err, todos)
	{
	
		res.json(todos);
	})
}

function PostTodo(req, res)
{   
	// console.log(req.file);
	// console.log(req.body);
	const todo = {
		text: req.body.text,
		createdBy: req.session.currentuser.username,
		taskPic: req.file.filename
	}

	saveTodo(todo, function()
	{
		res.redirect("/");
	})

}

function getTodos(callback)
{
	todoModel.find({}).then(function(todos)
	{
		callback(null, todos)
	})
	.catch(function()
	{
		callback("cant read todos")
	})
}


function saveTodo(todo, callback)
{
	todoModel.create(todo)
	.then(function()
	{
		callback(null);
	})
	.catch(function()
	{
		callback("cant save todo")
	})
}

function saveUser(user, callback)
{
	userModel.create(user).then(function()
	{
		callback(null);
	})
	.catch(function()
	{
		callback("cannot save user")
	})
}

function getUser(username, password, callback)
{
	userModel.find({ username: username, password: password })
	.then(function(data)
	{
		callback(null, data)
	})
	.catch(function(err)
	{
		callback("user not found");
	})
}