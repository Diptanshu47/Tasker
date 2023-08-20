const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const _ = require('lodash');
require('dotenv').config()

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set('view engine','ejs');

/************DB-connect*************/

mongoose.connect('"'+'mongodb+srv://'+process.env.URI_KEY+'"')
.then(function(){
    console.log("Connected Successfully to DataBase");
}).catch(function(err){
    console.log(err);
})

/************DB-Data-init*************/
const listschema = mongoose.Schema({
    name : String
})
const todo = mongoose.model("todo",listschema);

const todo1 = new todo({name : 'To Add item Click "Add new item"'});
const todo2 = new todo({name : 'Enter to or "+" icon to Save'});
const todo3 = new todo({name : "To Delete Click Checkbox"});
const page1arr = [todo1,todo2,todo3]

const pageschema = mongoose.Schema({
    name : String,
    content : [listschema]
})
const page = mongoose.model('page',pageschema)
/**********************************************/

var today = new Date();
var options={weekday : 'long',day : 'numeric',month : 'long'}
var day = today.toLocaleDateString('en-us',options);


const pages = []
function listpage() {
    page.find().then(function(info){
        info.forEach(function(type) {
            if(pages.includes(type.name)){

            }else{
                if(type.name == 'Favicon.ico'){
                    //leave It
                }else{
                    pages.push(type.name);
                }
            }
        });
    });
    return pages;
}


app.get('/',function(req,res){
    todo.find().then(function(ans){
            if (ans.length === 0){
                todo.insertMany(page1arr).then(function(){
                }).catch(function(err){
                    console.log(err);
                })
                res.redirect("/");
            }else{
                res.render('days.ejs',{title : day, items : ans , listslist : listpage()});
            }
        }).catch(function(err) {
            console.log(err);
        })
})


app.get('/:somepage',function(req,res){
    var pagename = _.capitalize([string=req.params.somepage])
    const content = page({
        name : pagename,
        content : page1arr
    })    
    page.findOne({name : pagename}).then(function(ans){
        if(!ans){
            content.save()
            pages.push(pagename);
            res.redirect('/'+pagename);
        }else{
            res.render('days.ejs',{title : ans.name, items : ans.content, listslist : listpage()})
        }
    }).catch(function(err){
        console.log(err);
    })
});


app.post('/listdelete',function(req,res){
    var check = req.body.button;
    const delbody = req.body.listpage;
    page.deleteOne({name : delbody}).then(function(){
        if(delbody == check){
            //leave it
        }else{
            pages.pop(delbody);
            res.redirect('/');
        }
       }).catch(function(err){
        console.log(err);
    })        
});


app.post('/del',function(req,res){
    const delitem = req.body.del;
    const pagedel = req.body.pagedel;
    if(pagedel === day){
        todo.deleteOne({_id : delitem}).then(function(){
            res.redirect('/');
           }).catch(function(err){
            console.log(err);
           })        
    }else{
        page.findOneAndUpdate({name : pagedel},{$pull :{content : {_id : delitem}}}).then(function(){
            res.redirect('/'+pagedel)
        }).catch(function(err){
            console.log(err);
        })
    }
});


app.post('/',function(req,res){
    var check = req.body.button;
    var item = req.body.todo;
    const todo4 = new todo({name : item});
    if(check===day){
        todo4.save()
        res.redirect('/'); 
    }else{
        page.findOne({name : check}).then(function(itemz){
            itemz.content.push(todo4);
            itemz.save()
            res.redirect('/'+check)
        }).catch(function(err){
            console.log(err);
        })
        res.redirect('/'+check);
    }
});


app.listen(3000, function(){
    console.log('Server Started @ Port 3000')
});