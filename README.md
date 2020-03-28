# Node.JS starter for repository pattern using TypeScript

This starter kit tries to implement a NodeJS, ExpressJS and MongoDb powered web application using repository pattern. I am using TypeScript instead of JavaScript for various reasons. It has RESTful endpoints exposed as well. I have tried to decouple the database layer from the business logic part of the application using repository pattern. So, whenever you need to change the database just change related repository & model files. Everything else should work as it is.

> This might not be the best implementation you have seen or might not follow all the principals.

# Following modules are used
- Express.JS
- Mongoose
- Cors
- Dotenv
- Bcrypt
- Winston
- Compression
- Validator
- Mocha with Chai and Faker

> You should easily be able to replace any of the following module with little modification.


# Usage
- Install TypeScript globally (`npm i -g typescript`)
- Install required modules (`npm install`)
- Compile typescript to javascript (`npm run compile`)
- Run (`npm start`)
- Go to `http://localhost:3000`. You should see a static html page.
