	var fs = require('fs');
	var http = require('http')
	var url = require('url')
	var formidable = require('formidable')
    var util = require('util')
    var path =require('path')
    var post_page;

	http.createServer(function(request, response) 
	{  

		// console.log(request.method);
		var pathname = url.parse(request.url).pathname;

		// console.log('this:'+pathname)

		if ( pathname == "/index_h.html" || pathname == "/") 
		{
			var post_html = []
			fs.readdir('./posts/',(err,data) => {
				if(err)
					console.log(err)

			for(var i in data)
			{
				if(path.extname(data[i]) === '.txt')
				{
					post_html[i] = buildHtml(data[i].split('.')[0]);
				}
			}
			})

        	fs.readFile('./templates/index_h.html', function (err, html) 
        	{
	     		if (err) {
	        		console.log(err); 
	     		}

         		response.writeHeader(200, {"Content-Type": "text/html"});  
	    		response.write(html); 
	    		for(var i =0 ; i < post_html.length ; i++)
	    		{
	    			response.write(post_html[i]);
	    			response.write('<br>');
	    		}
	    		response.end(); 
	    	})
    	} 

    	else if(request.url.match(/.html$/))
    	{
   			var requestUrl = url.parse(request.url)    
   			response.writeHead(200, {'Content-type':'text/html'})
   			// console.log(requestUrl.pathname)
   			fs.createReadStream(__dirname + '/build/' + requestUrl.pathname).pipe(response)
    	}

    	else if( path.extname(pathname) === '.txt' )
    	{
    		response.writeHead(200, {'content-type': 'text/plain'});
        	response.write('yahoo');
        	response.end();
    	}
    	
        else if(request.method === 'POST')
    	{
    		var form = new formidable.IncomingForm();
 
    		
    		 form.parse(request, function(err, fields, files){
        	var title = './posts/' + fields.title.toString();
        	var content = fields.upload.toString();
        	fs.writeFile(title +'.txt', content , 'utf8', (err)=>{
            	if(err)
                console.log(err)
        	})

        	fs.writeFile('./build/' + fields.title.toString() +'.html', buildPostHtml(content) , 'utf8', (err)=>{
            	if(err)
                console.log(err)
        	})

        	fields.title = "";
        	fields.upload = ""

        	response.writeHead(200, {'content-type': 'text/html'});
        	response.write('<a href=\"index_h.html\">Go Back</a>');

        	response.end();
			})
    	}       

	}).listen(8080);

	function buildHtml(title) 
	{
	  	return '<a href=' + title + '.html' + '>' + title + '</a>';
	};

	function buildPostHtml(content)
	{
		return '<!DOCTYPE html>'
       + '<html><body><p>' + content + '</p></body></html>';
	}