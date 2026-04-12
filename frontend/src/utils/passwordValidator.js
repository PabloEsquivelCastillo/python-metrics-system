export const validatePassword = (password) => {
    const requirements = {
        minLength: password.length >= 12,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    }

    return {
        isValid: Object.values(requirements).every(req => req),
        requirements,
    }
}

export const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: '#e9ecef' }

    const { requirements } = validatePassword(password)
    const metRequirements = Object.values(requirements).filter(Boolean).length

    if (metRequirements === 0) {
        return { level: 0, text: 'Muy débil', color: '#dc3545' }
    } else if (metRequirements <= 2) {
        return { level: 1, text: 'Débil', color: '#fd7e14' }
    } else if (metRequirements <= 4) {
        return { level: 2, text: 'Media', color: '#ffc107' }
    } else {
        return { level: 3, text: 'Fuerte', color: '#198754' }
    }
}
