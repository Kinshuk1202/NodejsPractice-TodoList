const express = require('express')
app = express()
const User = require('./models/user')
const mongoose = require('mongoose')
const path = require('path')
const bcrypt = require('bcrypt')
const session = require('express-session');
const Task = require('./models/task')
const methodOverride = require('method-override');
const user = require('./models/user')
const flash = require('connect-flash')
const uri = "mongodb+srv://kharekinshuk03:bfpLV5dxQdqwzTIt@testdb.knojxmo.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(uri)
    .then(() => {
        console.log("connection open")
    })
    .catch(err => {
        console.log("Oh no eorror!!")
        console.log(err)
})

app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(session({secret:'thisisnotagoodsecret' , resave:false, saveUninitialized:false}))
app.use(methodOverride('_method'))
app.use(flash());

 

const reqlogin  = (req,res,next)=>{
    if(!req.session.user_id)
        return res.redirect('/login')
    next();
}


app.get('/', (req,res)=>{
    if(!req.session.user_id)
        res.render('home')
    else
        res.redirect('/show')
})
app.get('/signup' , (req,res)=>{
    res.render('signup')
})
app.post('/signup',async (req,res)=>{
    
    try{
    const {username, password} = req.body;
    if(!password)
        throw e;
    const hash = await bcrypt.hash(password,12);
    const user =  new User({username:username,password:hash})
    await user.save()
    req.session.user_id = user._id;
    res.redirect('/show')
    }
    catch(e){
        res.send("Provide Both username and password")
    }
})

app.get('/show',async(req,res)=>{
    const user = await User.findById(req.session.user_id).populate('todos')
    if(user)
        res.render('show',{user})
    else
        res.redirect('/')
})
app.get('/login',(req,res)=>{
    res.render('login')
})
app.post('/login',async (req,res)=>{

    const {username , password} = req.body;
    const user = await User.validateUser(username,password)
    if(!user)
    {
        res.redirect('/login')
    }
    else
    {
        req.session.user_id = user._id
        res.redirect('/show')
    }
})
app.post('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/')
})


app.post('/todo/add',async (req,res)=>{
    const {todo} = req.body
    const task = new Task({todo:todo , username:req.session.user_id})
    await task.save()
    const user = await User.findById(req.session.user_id)
    user.todos.push(task)
    await user.save()
    res.redirect('/show')
})

app.get('/todo/add',reqlogin,(req,res)=>{
    const id = req.session.user_id;
    res.render('add',{id});
})

app.get('/update/:id',reqlogin,async (req,res)=>{
    const {id} = req.params;
    try{   
        const task = await Task.findById(id)
        if(task.username!=req.session.user_id)
                res.send("Todo Not Found!")
            else
                res.render('update',{task})
        }
    catch(e){
        res.send("Todo Not Found!")
    }
})

app.put('/update/:id',async (req,res)=>{
    const {todo} = req.body
    const {id} = req.params
    await Task.findByIdAndUpdate(id,{todo:todo});
    res.redirect('/show')

})
app.delete('/delete/:id', async(req,res)=>{
    try{
        await Task.findByIdAndDelete(req.params.id);
        res.redirect('/show')
    }
    catch(e)
    {
        res.send("No such task found!")
    }
})

app.use((req,res,next)=>{
    res.status(404).send("SOMETHING WENT WRONG 😖");
})

app.listen(6969,()=>{
    console.log('Serving on port:6969😎')
})


