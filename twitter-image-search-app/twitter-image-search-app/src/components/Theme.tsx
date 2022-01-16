/* eslint-disable */
import { createTheme } from '@material-ui/core/styles';

const AppTheme = {
  lightTheme: createTheme({
    palette: {
      type: "light",
    },
  }),
  darkTheme: createTheme({
    palette: {
      type: "dark",
    },
  }),
}

export default AppTheme;