type ValidationSignUpProps = {
    name: string;
    email: string;
    password: string;
};

const validateSignUp = ({name, email, password}:ValidationSignUpProps) =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(name.trim().length === 0){
        return { valid: false, message: "Name cannot be empty." };
    }

    if(!emailRegex.test(email)){
        return { valid: false, message: "Invalid email format." };
    }

    if(password.length < 6){
        return { valid: false, message: "Password must be at least 6 characters long." };
    }

    return true
}

export default validateSignUp;