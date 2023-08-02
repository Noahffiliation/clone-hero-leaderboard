import { NextUIProvider } from '@nextui-org/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";

function App({ Component, pageProps }) {
  return (
	<NextUIProvider>
		<NextThemesProvider attribute="class" defaultTheme="dark">
			<Component {...pageProps} />
		</NextThemesProvider>
	</NextUIProvider>
  )
}

export default App;
