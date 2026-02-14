import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from "next-themes";
import PropTypes from 'prop-types';

function App({ Component, pageProps }) {
	return (
		<NextUIProvider>
			<NextThemesProvider attribute="class" defaultTheme="dark">
				<Component {...pageProps} />
			</NextThemesProvider>
		</NextUIProvider>
	)
}

App.propTypes = {
	Component: PropTypes.elementType.isRequired,
	pageProps: PropTypes.object.isRequired,
}

export default App;
