import Menu from "components/menu"
import Head from "next/head"
import { useState } from "react"
import Uploader from "components/uploader"
import debug from "debug"

const KeysDebug = debug("keys")
debug.enable("keys")

export default function Keys({
  serialsProp,
  caseId,
}: {
  serialsProp: string[]
  caseId: string
}) {
  // const router = useRouter()
  // const {caseId}: {caseId?: string} = router.query
  const [serials, setSerials] = useState(serialsProp)
  const [files, setFiles] = useState<FileList>(null)

  const listSerials = (serials: string[]) => {
    KeysDebug(serials)
    return (
      <ol>
        {serials.map((serial) => {
          return <li key={serial}> {serial} </li>
        })}
      </ol>
    )
  }

  return (
    <div className="container">
      <Head>
        <title>Extract Keys</title>
      </Head>
      <main>
        <Menu currentPg="Extract Keys" caseId={caseId} />
        <h1>Extract Keys From 'p12' Container</h1>
        <p>
          The keys for decrypting emails will be located inside the p12 files.
          The keys must first be extracted before the decryption process. Keys
          will be stored on the server protected by one common password that you
          create. You will supply your password in the final step.
        </p>
        <h2>Upload p12 file(s)</h2>
        <Uploader
          caseId={caseId}
          fileType="p12"
          destination="decipher"
          files={files}
          setFiles={setFiles}
          setSerials={setSerials}
        />
        <h2>Key Serial #s</h2>
        <p>
          If a key is successfuly extracted, you will see its serial # listed
          here.
        </p>
        {listSerials(serials)}
      </main>
    </div>
  )
}
