import { FormEvent, useState } from 'react'
import debug from 'debug'

const SetPathDebug = debug('setPath')
debug.enable('setPath')
const apiExternal = process.env.apiExternal || 'localhost'

interface propsType {
  path: string,
  pathName: 'pstPath' | 'p12Path' | 'ptPath' | 'exceptionsPath',
  caseId: string,
  labelTxt: string
}

export default function SetPath (props: propsType) {
  const [ path, setPath ] = useState(props.path)
  
  const handleSubmit = async (e: FormEvent) => {
    const { pathName, caseId } = props
    let update = {}
    update[pathName] = path
    e.preventDefault()
    const url = `http://${apiExternal}:3000/cases/${caseId}`
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        mode: 'cors',
        // cache: 'no-cache',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(update)
      })
      if (res.ok) {
        alert('Path is valid')
      }
    } catch (err) {
      SetPathDebug(err)
      alert('Path is not valid')
    }
  }

  return( 
    <form onSubmit={handleSubmit}>
      <div className='form-group'>
        <label htmlFor='pstPath'>{props.labelTxt}</label>
        <input id='pstPath' type='text' className='form-control' value={path} onChange={e => setPath(e.target.value)} />
      </div>
      <button type='submit' className='btn btn-info'>Set Path & Validate</button>
    </form>
  )
}