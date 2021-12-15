import { FormEvent, useState, Dispatch, SetStateAction } from "react"
import debug from "debug"
import { apiExternal } from "../constants"
import ClipBtn from 'components/clipbtn'

const uploadDebug = debug('uploader')
debug.enable('uploader')

interface propsType {
	caseId: string,
	fileType: 'pst' | 'p12',
	destination: 'sigs' | 'decipher',
	files: FileList,
	setFiles: Dispatch<SetStateAction<FileList>>
}

export default function Uploader (props: propsType) {
	const { caseId, fileType, destination, files, setFiles } = props
	// decipher destination has 2 upload paths based on fileType - pst & p12; only upload pst to sigs
	const uriFType = destination == 'decipher'? `${fileType}/` : ''
  const url = `${apiExternal}:3000/${destination}/upload/${uriFType}${caseId}`
	uploadDebug(url)

  // Form submission
  const handleUpload = async (e: FormEvent) => {
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
			<p>Use the following URL if uploading with a script:<ClipBtn txtToCopy={url} /></p>
      <p><code>{url}</code></p>
			<div className='form-group'>
				<label htmlFor='files'>Select PSTs</label>
				<input id='files' type='file' multiple className='form-control-file' onChange={e => setFiles(e.target.files)} />
			</div>
			<button className='btn btn-primary' type='submit'>Upload</button>
		</form>
	)
}