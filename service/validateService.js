const validator = require('validator');
const CustomError = require("../error/customeError");

class ValidateService {
    static validateEmail(email) {
        try {
            if (!validator.isEmail(email)) {
                throw new CustomError(this.language, 'errors.validation.invalidEmail');
            }
        } catch (error) {
            throw error
        }
    }

    static validatePhoneNumber(phoneNumber) {
        try {
            if (phoneNumber.length < 9) {
                throw new CustomError(this.language, 'errors.validation.invalidPhoneNumber');
            }
        } catch (error) {
            throw error
        }
    }

    static validateAddress(address) {
        // Validate address
        if (!address.lat || !address.long) {
            throw new CustomError(this.language, 'errors.validation.missedlatlang')
        }
    }

    static validatePassword(password) {
        // Check if password is less than 8 characters 
        if (password.length < 8) {
            throw new CustomError(this.language, 'errors.validation.shortPassword')
        }

    }

    static roundFloat(floatNum) {
        try {
            const rounded = Math.round(floatNum * 1e2) / 1e2;
            return rounded;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ValidateService