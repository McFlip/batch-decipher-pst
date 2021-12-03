import { FormEvent, useState, Dispatch, SetStateAction } from "react"
import debug from "debug"

const uploadDebug = debug('uploader')
debug.enable('uploader')
const apiExternal = process.env.NEXT_PUBLIC_API_EXTERNAL || 'http://localhost'

interface propsType {
	caseId: string,
	fileType: 'pst' | 'p12',
	destination: 'sigs' | 'decipher',
	files: FileList,
	setFiles: Dispatch<SetStateAction<FileList>>
}

export default function Uploader (props: propsType) {
	const { caseId, fileType, destination, files, setFiles } = props

	// Form submission
  const handleUpload = async (e: FormEvent) => {
		// decipher destination has 2 upload paths based on fileType - pst & p12; only upload pst to sigs
		const uriFType = destination == 'decipher'? `${fileType}/` : ''
    const url = `${apiExternal}:3000/${destination}/upload/${uriFType}${caseId}`
		uploadDebug(url)
    const form = new FormData()
    e.preventDefault()
    if(!files) {
      alert(`Please select ${fileType} to upload`)
    } else {
      uploadDebug(files)
      Array.from(files).forEach(file => { form.append(fileType, file) })
			try {
				const res = await fetch(url, {
					method: 'POST',
					mode: 'cors',
					body: form
				})
				alert(await res.text())
			} catch (error) {
				uploadDebug(error)
				alert("upload failed :(")
			}
    }
  }

	return(
		<form onSubmit={handleUpload}>
			<div className='form-group'>
				<label htmlFor='files'>Select PSTs</label>
				<input id='files' type='file' multiple className='form-control-file' onChange={e => setFiles(e.target.files)} />
			</div>
			<button className='btn btn-primary' type='submit'>Upload</button>
		</form>
	)
}