var Post = Parse.Object.extend("Post");
var Comment = Parse.Object.extend("comment");

$("#post-comment-form").submit(function(event){
	event.preventDefault();
	var postId 		= $("#post-comment-id").val();
	var post 		= new Post({
							id: postId
						});
	var postComment = $("#post-comment").val();
	var user 		=  Parse.User.current();
	var comment 	= new Comment();

	comment.set("content", postComment);
	comment.set("user", user);
	comment.set("post", post);

	comment.save({ 
		success: function(obj){
			console.log("comment save!");
		},
		error: function(obj, error){
			console.log("commnet error.." + error.message);
		} 
	});
});

//check login user
function checklogin () {
	if (Parse.User.current()) {
		// console.log("logged in!.." + Parse.User.current().get("username"));
		$("#current-user").html("Welcome to my Blog! &nbsp;" + Parse.User.current().get("username"));
	}
	else {
		$("#current-user").html("Welcome to my Blog!");
	}
}
checklogin();

//for logout
$("#logout-submit").click(function(event) {
	Parse.User.logOut();
	// console.log("logout success..");
	checklogin();
});

// for login

$("#login").submit( function(event){
	event.preventDefault();
	var name = $("#login-username").val();
	var pass = $("#login-password").val();

	Parse.User.logIn(name, pass, {
		success: function(name, user){
			// console.log("log in success.. ");
			checklogin();
		},
		error: function(user, error){
			console.log("log in error .. " + error.message);
		}
	});

});

//for sign up
$("#sign-up").submit(function(event){
	event.preventDefault();
	var username = $("#signup-name").val();
	var password = $("#signup-password").val();

	var user = new Parse.User();
	user.set("username", username);
	user.set("password", password);

	user.signUp(null, {
		success: function(user) {
			checklogin();
		} 
	}, 
	{
		error: function (user, error) {
			console.log("sign up error" + error.message);
		}
	});
});

// show post on click 

$("#list").on("click", "a", function(event){
	event.preventDefault();
	var id 		= $(this).attr("href");
	var query 	= new Parse.Query(Post);
	query.equalTo("objectId", id);
	query.include("user");
	query.find({
		success: function(results){

			var output = "";

				var title 		= results[0].get("title");
				var content 	= results[0].get("content");
				var author_name = results[0].get("user");
				var author 		= author_name.get("username");
				var id 			= results[0].id;
				var src 		= ""; 
				var image 		= "";

				if (results[0].get("file")) {
					// var file = results[0].get("file");
					var src = results[0].get("file").url();
					// var url = file.url();
					var image = "<image class = 'image-preview' id = 'post-detail-image' src = ''>"; 
				}

				output += "<h2>"+title+" </h2>";
				output += "<blockquote>" + " Author: &nbsp;" + author +"</blockquote>";
				output += image;
				output += "<p>" + content +  "</p>";
			
			$("#post-detail").html(output);
			$("#post-detail").attr("data-id", id);
			$("#post-comment-id").val(id);
			$("#post-detail-image").attr("src", src);
		},

		error: function(error){
			console.log("error in show post.." + error.message);
		}
	});
});

//get & show post
function getPosts(){
	var query = new Parse.Query(Post);
	query.include("User");
	query.find({
		success: function(results){

			var output = "";
			for (var i in results) {
				var title 		= results[i].get("title");
				var content 	= results[i].get("content");
				var author_name = results[i].get("user");
				var author 		= author_name.get("username");
				var id 			= results[i].id;

				// console.log(results[i].get("file"));
				var image = "";
				if (results[i].get("file")) {
					var file = results[i].get("file");
					var url = file.url();
					// console.log(url);
					var image = "<image class = 'image-preview' src = '" + url + "'>"; 
				}

				output += "<li> <hr class = 'fancy-hr' />";
				output += "<h4> <a id = 'showPost-link' href = '" + id + "'>" + title + "</a></h4>";
				// output += "<small>" + " Author: &nbsp;" + author + "</small>";
				// output += image;
				// output += "<p>" + content +  "</p>";
				output += "</li>";
			}
			$("#list").html(output);
		},
		error: function(error){
			console.log('Query error...' + error.message);
		}
	});
}

getPosts();

$("#post-form").submit(function(event){
		event.preventDefault();
		var title 	= $("#post-title").val();
		var content = $("#post-content").val();
		var user 	= Parse.User.current();



		var newPost = new Post();
		newPost.set("title", title);
		newPost.set("content", content);
		newPost.set("user", user);

		//file upload
		var fileElement = $("#post-file")[0];
		var filePath = $("#post-file").val();
		var fileName = filePath.split("\\").pop();

		if (fileElement.files.length > 0) {
			var file = fileElement.files[0];
			var newFile = new Parse.File(fileName, file);
			newFile.save({ 
				success: function () {}, 
				error: function (file, error) {
					console.log("error in file uploading.."+error.message);
				}
			}).then(function(theFile){
				newPost.set("file", theFile);
			    newPost.save({
			    	success: function  () {
			    		getPosts();
			    	},
			    	error: function (error){
			    		console.log("File saving problem.." + error.message);
			    	}
			    });
			});
		}
		else {
			// console.log(title);
		    newPost.save({
		    	success: function  () {
		    		getPosts();
		    	},
		    	error: function (error){
		    		console.log("sorry there is a error" + error.message);
		    	}
		    });
		}
	});