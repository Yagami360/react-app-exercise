import { createMuiTheme } from '@material-ui/core/styles';

const AppTheme = {
  lightTheme: createMuiTheme({
    palette: {
      type: "light",
    },
  }),
  darkTheme: createMuiTheme({
    palette: {
      type: "dark",
    },
  }),
}

export default AppTheme;