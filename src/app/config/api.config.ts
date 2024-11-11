export const API_CONFIG = {
    baseUrl: 'https://localhost:7226/api',
    endpoints: {
      user: {
        base: '/User',
        authenticate: '/Authenticate',
        checkEmail: '/CheckEmailExists/check-email',
        info: '/GetUserInfo'
      },
      doctor: {
        base: '/Doctor',
        register: '/RegisterDoctor',
        cards: '/GetDoctorCards',
        byId: '/GetDoctorById',
        delete: '/DeleteDoctorById'
      },
      patient: {
        base: '/Patient',
        register: '/RegisterPatient'
      }
    }
  };