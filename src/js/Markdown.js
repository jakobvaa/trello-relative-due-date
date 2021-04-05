import fs from 'fs'
import marked from 'marked'
import React, {useMemo, useCallback} from 'react'
import ReactDOM from 'react-dom'
const Marked = () => {
	const markdown = useMemo(() => {
		const file = fs.readFileSync('./src/README.md', {encoding: 'utf-8'})
		const rawMarkup = marked(file, {sanitize: true})
		return { __html: rawMarkup}
	}, [])

	console.log('markdo', markdown)
	if(markdown.__html) {
		return (
			<div dangerouslySetInnerHTML={markdown}/>
		)
	}
	return null


}


ReactDOM.render(<Marked />, document.getElementById('root'))