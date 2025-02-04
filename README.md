/*************************************************************************
   * * Links Docs
   * * - https://reactnavigation.org/docs/getting-started   
   * * Instalar Navigation
   * * - npm install @react-navigation/native
   * * - npm install react-native-screens react-native-safe-area-context
   * *  Editar archivo (android/app/src/main/java/packege/MainActivity.kt)
   * * - 
   override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
   
   
   * * - import android.os.Bundle; (agregar en la linea 2)
   * **********************************************************************
   
   
   
   * * Link Icons
   * * https://github.com/oblador/react-native-vector-icons
   * * https://ionic.io/ionicons
   * * Instalar React Native Icons Android
   * * npm install --save react-native-vector-icons
   * * npm i --save-dev @types/react-native-vector-icons
   * * Editar archivo (android/app/build.gradle)
   
	project.ext.vectoricons = [
		iconFontNames: [ 'MaterialIcons.ttf','Ionicons.ttf'] // Specify font files
	]

	apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")

   
   
   * * Instar Stack Navigation
   * * Links Docs
   * * - https://reactnavigation.org/docs/stack-navigator/
   * * Instalar Depecias
   * * npm install @react-navigation/stack
   * * npm install react-native-gesture-handler
   * * import 'react-native-gesture-handler';  (app.tsx inicio)
   * * npm install @react-native-masked-view/masked-view
   
   * * Instar Bottom Tabs Navigator
   * * Links Docs
   * * - https://reactnavigation.org/docs/bottom-tab-navigator/
   * * Instalar Depecias
   * * npm install @react-navigation/bottom-tabs
   
   
   * * Instar Top Tabs Navigator
   * * Links Docs
   * * - https://reactnavigation.org/docs/material-top-tab-navigator/
   * * Instalar Depecias
   * * npm install @react-navigation/material-top-tabs react-native-tab-view
   * * npm install react-native-pager-view 
   
   
   * * Link Docs Zustand
   * * - https://zustand-demo.pmnd.rs/
   
   * * Instalar Zustad
   * * - npm i zustand
   
   * * LInk Docs Peper
   * * https://callstack.github.io/react-native-paper/docs/guides/getting-started/
   * * Instalar Paper
   * * - npm install react-native-paper
   * * - npm install react-native-safe-area-context
   
   * * Link Docs TansTack Query
   * * https://tanstack.com/query/latest/docs/framework/react/quick-start
   * * Instalar TansTack Query
   * * npm i @tanstack/react-query  
   
   * * Link dotenv (Variable de entorno)
   * *  - https://www.npmjs.com/package/react-native-dotenv
   * * Instalar 
   * * - npm install -D react-native-dotenv
   * * - Modificar archivo babel.config.js
   
   module.exports = {
  presets: [ 'module:@react-native/babel-preset' ],
  plugins: [
    [
      "module:react-native-dotenv",
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env'
      }
    ]
    // Reanimated
  ]
};
   
   * * - crear archivo types/env.d.ts
   * * NOTA IMPORTANTE
   * * - Una vez configurado las variable de entorno se recomienda reiniciar el equipo 
   ************************************************************************/
   
   
   npm install formik --save	
	
	npm i axios 


npm i yup
npm i react-hook-form
npm i @hookform/resolvers
npm install @react-native-picker/picker --save | https://github.com/react-native-picker/picker

npm i react-native-autocomplete-input  | https://www.npmjs.com/package/react-native-autocomplete-input


npm i react-native-modal-datetime-picker | https://www.npmjs.com/package/react-native-modal-datetime-picker

npm install react-native-webview

npm i react-native-prompt-android --save | 


* * Instalar  TansTack Query
 * * - npm i @tanstack/react-query 
 *  * Link docs Formik
 * * - https://formik.org/docs/overview
 * * - https://tanstack.com/query/latest/docs/framework/react/quick-start
 
   
   
   
   
   
*****************************************************************************************************************************************************   
#   r e a c t - e r g o s a n i t a s - a p p  
 