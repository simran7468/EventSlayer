const manageUserModel = require("../models/userModel");
const status = require("../config/status");
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        let UserExists = await manageUserModel.findOne({ email: req.body.email }).lean().exec();
        if (UserExists) {
            return res.json({ success: false, status: status.INVALIDSYNTAX, msg: 'User already registered.' });
        }
        var obj = {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: req.body.password,
            dob: req.body.dob,
            gender: req.body.gender,
            standard: req.body.standard,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
        }
        const newmanageUserModel = new manageUserModel(obj);
        let result = await newmanageUserModel.save();
        res.json({ success: true, status: status.OK, msg: 'New user add  successfully.' });

    }
    catch (err) {
        console.log("error", err);
        return res.json({ success: false, status: status.INTERNAL_SERVER_ERROR, err: err, msg: 'Save Users failed.' });

    }
}

exports.getUsers = async (req, res) => {
    try {
        const data = await manageUserModel.find({}).lean().exec();
        return res.json({ data: data, success: true, status: status.OK });
    }
    catch (err) {
        console.log(`getting this error ${err}`);
        return res.json({ success: false, status: status.INTERNAL_SERVER_ERROR, err: err, msg: 'Get Users failed.' });

    }
}

exports.updateUser = async (req, res) => {
    var id = req.body._id;
    if (id === undefined) {
        return res.json({ success: false, status: status.NOTFOUND, msg: 'Id Parameter Not Available' });
    }
    // delete req.query.id;
    try {
        let result = await manageUserModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    fname: req.body.fname,
                    lname: req.body.lname,
                    email: req.body.email,
                    password: req.body.password,
                    dob: req.body.dob,
                    gender: req.body.gender,
                    standard: req.body.standard,
                    address: req.body.address,
                    city: req.body.city,
                    role: req.body.role
                }
            },
        ).lean().exec();

        if (result) {
            res.json({ success: true, status: status.OK, msg: 'User is updated successfully.' });
        }
        else {
            return res.json({ success: false, status: status.NOTFOUND, msg: 'User Id not found' });
        }
    }
    catch (err) {
        console.log(err);
        return res.json({ success: false, status: status.INTERNAL_SERVER_ERROR, err: err, msg: 'Update User failed.' });

    }
}

exports.getUserById = async (req, res) => {
    try {
        let userid = req.query.userid;
        if (userid === undefined) {
            return res.json({ success: false, status: status.NOTFOUND, msg: 'Id Parameter Not Available' });
        }
        const data = await manageUserModel.findOne({ _id: userid }).lean().exec();
        return res.json({ data: data, success: true, status: status.OK });
    }
    catch (err) {
        console.log("error", err);
        return res.json({ success: false, status: status.INVALIDSYNTAX, err: err, msg: 'Get user failed.' });
    }

}

exports.login = async (req, res) => {
    console.log("testdugkhdfinvk,")
    try {
        var email = req.body && req.body.email ? req.body.email : '';
        var password = req.body && req.body.password ? req.body.password : '';
        var user = await manageUserModel.findOne({ email: email }).select("email username password ").lean().exec();
        if (!user) {
            res.json({ success: false, status: status.NOTFOUND, msg: 'Authentication failed. User not found.' });
        } else {

            let ifPasswordMatch = await manageUserModel.findOne({ password: password }).lean().exec();
            if (ifPasswordMatch) {
                var userResp = user;
                delete userResp.password;

                res.json({ success: true, msg: 'login successful', user: userResp });
            } else {
                res.json({ success: false, status: status.NOTFOUND, msg: 'Authentication failed. Wrong password.' });
            }
        }
    } catch (e) {
        console.log("e", e)
        return res.json({ success: false, status: status.INVALIDSYNTAX, err: e, msg: 'Error in login.' });
    }
}

// Login with token
exports.loginAuth = async (req, res) => {
    try {
        var email = req.body.email || '';
        var password = req.body.password || '';

        var user = await manageUserModel.findOne({ email: email }).select("email username password").lean().exec();
        
        if (!user) {
            return res.status(404).json({ success: false, msg: 'Authentication failed. User not found.' });
        }

        let ifPasswordMatch = await manageUserModel.findOne({ password: password }).lean().exec();
        
        if (!ifPasswordMatch) {
            return res.status(404).json({ success: false, msg: 'Authentication failed. Wrong password.' });
        }

        // Generate token if the user is authenticated
        const userResp = { ...user };
        delete userResp.password;
        const tokenData = {
            id: user._id,
            email: user.email,
            username: user.username,
        };

        const authToken = jwt.sign(tokenData, process.env.JWT_SECRET_CODE);

        return res.status(200).json({ success: true, msg: 'Login successful', user: userResp, authToken: authToken });
        
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, msg: 'Error in login.' });
    }
};
  

exports.delete = async (req, res) => {
    try {
        const ID = req.query.id;
        if (ID === undefined) {
            return res.json({ success: false, status: status.NOTFOUND, msg: 'Id Parameter Not Available' });
        }
        let result = await manageUserModel.findOneAndDelete({ _id: ID }).lean().exec();
        if (result) {
            res.json({ success: true, status: status.OK, msg: 'User is Deleted successfully.' });
        }
        else {
            return res.json({ success: false, status: status.NOTFOUND, msg: 'User Id not found' });
        }
    }
    catch (err) {
        return res.json({ success: false, status: status.INTERNAL_SERVER_ERROR, err: err, msg: 'Delete User data failed.' });

    }
}

exports.changePassword = async (req, res) => {
    console.log("req.body----", req.body)
    try {
        const email = req.body.email;
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword; // New field for confirmation password
        // Find the user in the database
        const user = await manageUserModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, msg: 'User not found.' });
        }
        // Verify current password
        if (currentPassword !== user.password) {
            return res.json({ success: false, msg: 'Invalid current password.' });
        }
        if (newPassword !== confirmPassword) {
            return res.json({ success: false, msg: 'New password and confirmation password do not match.' });
        }
        await manageUserModel.updateOne({ email }, { password: newPassword });
        return res.json({ success: true, msg: 'Password changed successfully.' });
    } catch (e) {
        console.error("Error in change password:", e);
        return res.json({ success: false, err: e, msg: 'Error in change password.' });
    }
};



exports.search = async (req, res) => {
    try {
        // Extract the search query from the request
        const query = req.query.search;

        // If no query is provided, return a 400 error
        if (!query) {
            return res.status(400).json({ error: 'No search query provided' });
        }

        // Split the query into an array of individual search terms (for skills)
        const searchTerms = query.split(',').map(term => term.trim());

        // Construct the search query for MongoDB using the $or operator
        const searchQuery = {
            $or: [
                { fname: { $regex: new RegExp(query, "i") } },
                { lname: { $regex: new RegExp(query, "i") } },
                { email: { $regex: new RegExp(query, "i") } },
                { address: { $regex: new RegExp(query, "i") } },
                { city: { $regex: new RegExp(query, "i") } },
                { state: { $regex: new RegExp(query, "i") } }
            ]
        };

        // Check if the query contains both first and last names separated by a space
        if (query.includes(' ')) {
            const [firstName, lastName] = query.split(' ');

            // Add a condition to match both first and last names together
            searchQuery.$or.push({
                $and: [
                    { fname: { $regex: new RegExp(firstName, "i") } },
                    { lname: { $regex: new RegExp(lastName, "i") } }
                ]
            });
        }

        // Execute the search query against the user model
        const results = await manageUserModel.find(searchQuery).lean().exec();

        // Return the search results as JSON
        res.json({ success: true, data: results });
    } catch (err) {
        console.error("Error:", err);

        // Return a 500 error response in case of an internal server error
        return res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
};