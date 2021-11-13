const router = require('express').Router();
const { User, Post, Vote } = require('../../models');

//GET /api/users
router.get('/', (req, res) => {
    //Access our User model and run .findAll() method
    User.findAll({
        attributes: {exclude: ["password"]}
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

//GET /api/users/1
router.get('/:id', (req, res) => {
    User.findOne({
        attributes: {exclude: ["password"]},
        where: {
            id: req.params.id
        },
        include: [
            {
                modle: Post,
                attributes: ['id', 'title', 'post_url', 'created_at']
            },
            {
                model: Post,
                attributes: ['title'],
                through: Vote,
                as: 'votes_posts'
            }
        ]
    })
    .then(dbUserData => {
        if(!dbUserData) {
            res.status(404).json({message: "No user found with this id"});
            return;
        }
        res.json(dbUserData)
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
});

//POST /api/users
router.post('/', (req, res) => {
    //expects {username: 'len", email:'len@email.com', password: 'password1234'}
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
});

//Verify user
router.post('/login', (req, res) => {
    // expects {email: 'line@email.com, password: 'password123"}, Notice we used findOne instead of creates
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then(dbUserData => {
        if(!dbUserData) {
            res.status(400).json({message: 'No user with that email address.'});
            return;
        }

       

        //Verify user
        const validPassword = dbUserData.checkPassword(req.body.password);
        if (!validPassword) {
            res.status(400).json({message: 'Incorrect password!'});
            return;
        }

        res.json({user: dbUserData, message: 'You are now logged in!'})
    }) 
})

// PUT /api/users/1
router.put('/:id', (req, res) => {
        //expects {username, email, passord k/value pairs}
        //if req.body has exacat key/value paris to match the model, you can just use `req.body` instead
        User.update(req.body, {
            individualHooks: true,
            where: {
                id: req.params.id
            }
        })
        .then(dbUserData => {
            if(!dbUserData[0]) {
                res.status(404).json({message: 'No user Found with this id'});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
    
});

//DELETE /api/users/1
router.delete('/:id', (req, res) => {
    router.delete('/:id', (req, res)=> {
        User.destroy({
            where: {
                id: req.params.id
            }
        })
    })
    .then(dbUserData => {
        if(!dbUserData) {
            res.status(404).json({message: 'No user found with this id'})
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.lof(err);
        res.status(500).json(err);
    })
});

module.exports = router;