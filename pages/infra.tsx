import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next'
import Page from '../components/layout/Page';
// import contracts from '../lib/contracts';
// import { provider } from '../lib/provider';

const SUBGRAPHS = [
  `https://graph.node.bean.money/subgraphs/name/beanstalk`,
  `https://graph.node.bean.money/subgraphs/name/beanstalk-dev`,
  `https://graph.node.bean.money/subgraphs/name/beanstalk-testing`
]

const checkSubgraphStatus = async (url: string) => {
  return (
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          _meta {
            block {
              number
            }
            deployment
            hasIndexingErrors
          }
          beanstalk(id: "0xc1e088fc1323b20bcbee9bd1b9fc9546db5624c5") {
            lastUpgrade
            lastSeason
            subgraphVersion
          }
        }`
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((r) => r.json())
    .then((r) => r.data)
  );
}

const Subgraph : React.FC<{ url: string, latestBlockNumberNetwork?: number }> = ({ url, latestBlockNumberNetwork }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [intv, setIntv] = useState<null | NodeJS.Timer>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await checkSubgraphStatus(url)
    setData(data);
    setLoading(false);
  }, [url]);

  useEffect(() => {
    if (!intv) {
      load();
      const _intv = setInterval(load, 1000 * 10);
      setIntv(_intv);
    }
  }, [intv, load])

  return (
    <tr className="space-x-4">
      <td><a href={url} target="_blank" rel="noreferrer">{url.split("/").pop()}</a></td>
      <td>{data?._meta.block.number || '-'}</td>
      <td>{data?._meta.hasIndexingErrors.toString() || '-'}</td>
      <td>{data?.beanstalk.lastSeason || '-'}</td>
      <td>{data?.beanstalk.subgraphVersion || '-'}</td>
      <td>{loading ? 'loading...' : null}</td>
    </tr>
  )
}

const Infra: NextPage = () => {
  return (
    <Page>
      <div>
        <table className="max-w-8xl border-separate px-4 py-2 border-spacing-2">
          <thead>
            <tr className="space-x-4">
              <th>Name</th>
              <th>Block Number</th>
              <th>Indexing errors?</th>
              <th>Last Season</th>
              <th>Version</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {SUBGRAPHS.map((url) => <Subgraph url={url} key={url} latestBlockNumberNetwork={0} />)}
          </tbody>
        </table>
      </div>
    </Page>
  )
}

export default Infra