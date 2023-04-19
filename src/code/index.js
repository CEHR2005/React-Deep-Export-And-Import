import { stripSymbols } from 'apollo-utilities';
import {insertLinksFromFile} from "./insert.js";
import { gql } from '@apollo/client';
import { saveAs } from "file-saver";


async function getMigrationsEndId(client) {
    const result = await client.query({
        query: gql`
            query Links {
                links(where: {type_id: {_eq: "182"}}) {
                    id
                }
            }
        `
    });
    return result.data.links[0].id;
}
function getLinksGreaterThanId(client, id) {
    return client.query({
        query: gql`query ExportLinks {
            links(order_by: { id: asc }, where: { id: { _gt: ${id} } }) {
                id
                from_id
                to_id   
                type_id
                object {
                    value
                }
                string {
                    value
                }
                number {
                    value
                }
            }
        }
    `,
    })
}
async function saveData(client) {
    getLinksGreaterThanId(client, await getMigrationsEndId(client))
        .then((result) => {
            let links = stripSymbols(result)
            links = links.data.links.slice()
            for (let item of links) {
                if (item.object) {
                    if (item.object && item.object.__typename) {
                        delete item.object.__typename;
                    }
                }
                if (item.string) {
                    if (item.string && item.string.__typename) {
                        delete item.string.__typename;
                    }
                }
                if (item.number) {
                    if (item.number && item.number.__typename) {
                        delete item.number.__typename;
                    }
                }
                if (item.__typename){
                    delete item.__typename
                }
            }

            const now = new Date();
            const filename  = `./Saves/data-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`;
            // fs.writeFileSync(filename, JSON.stringify(links), (err) => {
            //     if (err) throw err;
            //     console.log('File saved!');
            // });

            const blob = new Blob([JSON.stringify(result.data)], {
                type: "text/plain;charset=utf-8",
            });
            saveAs(blob, filename);

        })
        .catch((error) => console.error(error));
}

function deleteLinksGreaterThanId(client, id) {
    client
        .mutate({
            mutation: gql`
        mutation DeleteLinks($id: bigint) {
          delete_links(where: { id: { _gt: $id } }) {
            affected_rows
          }
        }
      `,
            variables: { id },
        })
        .then((result) => {
            console.log(`Deleted ${result.data.delete_links.affected_rows} rows`);
        })
        .catch((error) => console.error(error));
}


async function LoadData(client, data, gqllink) {
    deleteLinksGreaterThanId(client, await getMigrationsEndId(client))
    await insertLinksFromFile(data, gqllink)
}

export {LoadData, saveData}