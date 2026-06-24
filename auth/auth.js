const {validateEmail , createUserQuery} = require('../repo/users.repo')

const auth = (req , res) => {
    try{
        const {email , newUser} = req.body

        let user = validateEmail(email)

        if(!user && newUser){
            let newUser = createUserQuery(email)
            user = validateEmail(email)
        }

        if(user){
            return res.status(200).json({id: user.id})
        }else{
            return res.status(401).json({message: 'Unauthorized. Please try again.'})
        }
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

module.exports = {auth}