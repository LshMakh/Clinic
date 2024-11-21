export const API_CONFIG = {
    baseUrl: 'https://localhost:7226/api',
    endpoints: {
      user: {
        base: '/User',
        authenticate: '/Authenticate',
        checkEmail: '/CheckEmailExists/check-email',
        info: '/GetUserInfo',
        forgotPassword: '/ForgotPassword/forgot-password',
        changePassword:'/ChangePassword/change-password'
      },
      doctor: {
        base: '/Doctor',
        register: '/RegisterDoctor',
        cards: '/GetDoctorCards',
        byId: '/GetDoctorById',
        delete: '/DeleteDoctorById',
        categories:'/GetSpecialtyCount/specialty-count'
      },
      patient: {
        base: '/Patient',
        register: '/RegisterPatient'
      },
      verify:{
        base: '/Verification',
        activationCode: '/send',
        verifyCode: '/verify'
      }
    }
  };