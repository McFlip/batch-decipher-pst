import { FormEvent, useState, Dispatch, SetStateAction } from "react"
import debug from "debug"
import axios from "axios"
import { apiExternal } from "constants/"
import ClipBtn from 'components/clipbtn'

const uploadDebug = debug('uploader')
debug.enable('uploader')

interface propsType {
	caseId: string,
	fileType: 'pst' | 'p12',
	destination: 'sigs' | 'decipher',
	files: FileList,
	setFiles: Dispatch<SetStateAction<FileList>>,
	setSerials?: Dispatch<SetStateAction<string[]>>
}

export default function Uploader (props: propsType) {
	const { caseId, fileType, destination, files, setFiles, setSerials } = props
	// decipher destination has 2 upload paths based on fileType - pst & p12; only upload pst to sigs
	const uriFType = destination == 'decipher'? `${fileType}/` : ''
  const url = fileType === 'pst' ? `${apiExternal}:3000/${destination}/upload/${uriFType}${caseId}` : `${apiExternal}:3000/keys/${caseId}`
	const [p12PW, setP12PW] = useState('')
	const [keyPW, setKeyPW] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [deletingPSTs, setDeletingPSTs] = useState(false)
	uploadDebug(url)

  // Delete PSTs
  const handleDelete =async () => {
    const url = `${apiExternal}:3000/${destination}/upload/pst/${caseId}`
    if (!confirm('Are you sure? This cannot be undone!')) return
    setDeletingPSTs(true)
    const res = await axios.delete(url)
    if (res.status !== 200) alert('Deleting PSTs failed :(')
    setDeletingPSTs(false)
  }

  // Form submission
  const handleUpload = async (e: FormEvent) => {
    const form = new FormData()
		let valid = true
    e.preventDefault()
    if(!files) {
			valid = false
      alert(`Please select ${fileType} to upload`)
    }
		if(fileType === "p12" && !p12PW) {
			valid = false
			alert("Please enter the password for the p12 container")
		}
		if(fileType === "p12" && !keyPW) {
			valid = false
			alert("Please create a password for the key")
		}
		if (valid) {
      uploadDebug(files)
			setIsRunning(true)
      Array.from(files).forEach(file => { form.append(fileType, file) })
			if (fileType === "p12") {
				form.append("p12PW", p12PW)
				form.append("keyPW", keyPW)
				form.append("caseId", caseId)
			}
			try {
				// const headers = {'Content-Type': 'application/json'}
				const res = await axios.post(url, form)
				if (fileType === "p12") {
					setSerials(res.data)
					alert('key extracted')
				} else {
					const resTxt = res.data
					alert(resTxt)
				}
				setIsRunning(false)
			} catch (error) {
				setIsRunning(false)
				uploadDebug(error)
				alert("upload failed :(")
			}
    }
  }

	const pwForm = () => {
		return(
			<div className="form-group">
				<label htmlFor="p12pw">Enter password for p12 file:</label>
				<input id="p12pw" type="password" className="form-control" onChange={e => setP12PW(e.target.value)} value={p12PW} />
				<label htmlFor="keypw">Use a password manager to create a new password for the extacted key:</label>
				<input id="keypw" type="password" className="form-control" onChange={e => setKeyPW(e.target.value)} value={keyPW} />
			</div>
		)
	}

	const deleteForm = () => {
		return(
			<div className="container">
				<hr/>
				<h3>Delete previous uploads</h3>
				<p>If working in batches, delete previous input before uploading next batch</p>
				<button className='btn btn-danger' disabled={deletingPSTs} onClick={() => handleDelete()}>
					{ deletingPSTs ? 'Deleting...' : 'Delete Uploads'}
				</button>
				<hr/>
			</div>
		)
	}

	const setFilesVerified = (fList: FileList) => {
	let verifiedArr: boolean[] = []
	const verify = (fExt: 'p12' | 'pst',f: File) => {
		switch (fExt) {
			case 'p12':
				return f.type === 'application/x-pkcs12'
			case 'pst':
				// unable to detect MIME type for PST; fall back to file extension
				return f.name.match(/.*\.pst/) !== null
			default:
				return false
		}
	}
	for (let i = 0; i < fList.length; i++) {
		verifiedArr.push(verify(fileType, fList[i]))
	}
	if(verifiedArr.reduce((prev, curr) => prev && curr)) {
		setFiles(fList)
	} else {

		alert('Check file upload type')
	}
}

	return(
		<div>
			{fileType === "pst" ? deleteForm() : ''}
			<p>Use the following URL if uploading with a script:<ClipBtn txtToCopy={url} /></p>
      <p><code>{url}</code></p>
			<form onSubmit={handleUpload} role='form'>
				<div className='form-group'>
					<label htmlFor='files'>Select {fileType === "pst" ? 'all PSTs' : 'one p12 at a time'}</label>
					<input id='files' type='file' multiple={fileType != "p12"} role='button' aria-label="File Upload" className='form-control-file' onChange={e => setFilesVerified(e.target.files)} />
				</div>
				{fileType === "p12" ? pwForm() : ''}
				<button className='btn btn-primary' type='submit' disabled={isRunning}>Upload{isRunning? 'ing...' : ''}</button>
			</form>
		</div>
	)
}