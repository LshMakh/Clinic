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
        categories:'/GetSpecialtyCount/specialty-count',
        photo:'/GetDoctorPhoto/photo',
        cv: '/ExtractCvText/extract-cv',
        update:'/UpdateDoctor/update'
      },
      patient: {
        base: '/Patient',
        register: '/RegisterPatient'
      },
      verify:{
        base: '/Verification',
        activationCode: '/send',
        verifyCode: '/verify'
      },
      appointment:{
        base: '/Appointment',
        count:'/count',
        book:'/book',
        blockTime:'/block',
        loadDoc:'/doctor',
        loadPat:'/patient',
        update:'/description',
        delete:'',
        available:'/available-slots/',
        slotAvailable:'/check-availability/',
      }
    }
  };