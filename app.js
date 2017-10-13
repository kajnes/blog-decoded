var express     = require ("express");
var app         = express();
var bodyParser  = require("body-parser");
var mongoose    = require("mongoose");
var methodOverride = require("method-override");  //overrride for PUT, DELETE etc...


// APP CONFIG
app.set ("view engine", "ejs");
app.use (express.static("public"));
app.use (bodyParser.urlencoded({extended:true}));
app.use (methodOverride("_method"));


mongoose.connect("mongodb://localhost/decoded_blog_app", {
  useMongoClient: true
});

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
title: String,
lead: String,
//image: {type: String, default: "blank_image.jpg"},
image: String,
body: String,
category: {type: String, default: "Informacje"},
keywords: String,
slug: { type: String, index: { unique: true } },
created: {type: Date, default: Date.now}
    
});

//friendly URLs
  function slugify(text) {

    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
  }


 blogSchema.pre('save', function (next) {
    this.slug = slugify(this.title);
    next(); 
  });
//end friendly URLs

var Blog = mongoose.model("Blog", blogSchema);

// TEST DATA INSERT
// Blog.create({
//     title: "Ala ma kota",
//     lead: "lead test",
//     image: "https://media.gcflearnfree.org/content/55e0730c7dd48174331f5164_01_17_2014/desktop_full_view_alt.jpg",
//     body: "A computer is a device that can be instructed to carry out arbitrary sequences of arithmetic or logical operations automatically. The ability of computers to follow generalized sets of operations, called programs, enables them to perform an extremely wide range of tasks.",
//     category: "Technologia",
//     keywords: "komputer, technologia"
// });


// RESTful ROUTES




//ADMIN NEW ROUTE
app.get ("/admin/new",function(req, res){
  res.render("new");
});


//ADMIN CREATE ROUTE
app.post("/admin",function(req,res){
  //create post
  Blog.create(req.body.post, function(err,newPost){
    if (err){
      console.log ("Error @admin create");
      res.render("new");
    }
    else{
      //redirect    
      res.redirect("/admin");
    }
  });
  
});


//ADMIN EDIT ROUTE
app.get ("/admin/:id/edit",function(req,res){
  Blog.findById(req.params.id, function(err, postToEdit){
    if (err){
      console.log ("Error @post edit route");
      res.redirect("/admin/");
    } else{
      res.render ("edit",{post:postToEdit});    
    }
  });
  
});


//ADMIN UPDATE ROUTE
app.put("/admin/:id",function(req,res){
  //res.send ("Wpis został zaktualizowany.");
  this.slug = slugify(req.body.post.title);
  console.log(this.slug);
  Blog.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
    if (err){
      console.log ("Error @update route");
      res.redirect("/admin/");
    }else{
      //friendly url update
       Blog.findByIdAndUpdate(req.params.id, {slug: this.slug}, function(err, updatedPost){
        if (err) {
          console.log("error @update route - friendly url");
        }else{
          res.redirect("/admin/");
        }
       })
    }
  })
});


//ADMIN DELETE ROUTE
app.delete ("/admin/:id",function(req,res){
 console.log("admin destroy route");
  Blog.findByIdAndRemove(req.params.id, function(err){
    if (err){
      console.log("Error @delete route");
      res.redirect("/admin/");
    } else{
      res.redirect("/admin/");
    }
  });
});

//ADMIN INDEX ROUTE
app.get ("/admin/",function(req, res){
  Blog.find({},function(err,posts){
    if (err){
      console.log("Error @index");
    }
    else{
          console.log("admin index route");
          res.render("admin_index",{posts:posts});
          
    }
    });
});

//SHOW POST ROUTE
app.get ("/:slug",function(req,res){
  Blog.findOne({slug: req.params.slug}, function(err,readMore){
    if (err){
      console.log ("Error @show post route");
    } else{
         console.log("show post route");
         res.render ("show",{post:readMore});
         
    }
  });
});

//INDEX ROUTE
app.get ("/", function(req, res){
  Blog.find({},function(err,posts){
    if (err){
      console.log("Error @index");
    }
    else{
          console.log("index route");
          res.render("index",{posts:posts});

    }
    });
  });




// Server 
app.listen(process.env.PORT, process.env.IP, function(){
    console.log ("decoded blog is running.....")
});
