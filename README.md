# node-bot

REST API for mobile applications using Node.js and Express.js framework with Mongoose.js for working with MongoDB.


## HTTP methods


<table>
    <tr>
        <th><span class="caps">HTTP</span> Method</th>
        <th>Path</th>
        <th>Action</th>
        <th>Retun</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><span class="caps">GET</span></td>
        <td>/test</td>
        <td>Test</td>
        <td>Response message(String)</td>
        <td>Test whether api server is running.</td>
    </tr>
    <tr>
        <td><span class="caps">POST</span></td>
        <td>/imagedatas</td>
        <td>Create</td>
        <td>Response message(String)</td>
        <td>Parse a image data file and set a tagged database.</td>
    </tr>
    <tr>
        <td><span class="caps">POST</span></td>
        <td>/voicedatas</td>
        <td>Create</td>
        <td>Response message(String)</td>
        <td>Parse a voice data file and set a tagged database.</td>
    </tr>
    <tr>
        <td><span class="caps">GET</span></td>
        <td>/nouns/:message</td>
        <td>Show</td>
        <td>Nouns(JSON Object)</td>
        <td>Show list of nouns extracted from Natural Language.</td>
    </tr>
    <tr>
        <td><span class="caps">GET</span></td>
        <td>/photos/:message</td>
        <td>Show</td>
        <td>Images(JSON Object)</td>
        <td>Display a specific photo processed by Natural Language.</td>
    </tr>
    <tr>
        <td><span class="caps">GET</span></td>
        <td>/voice/:message</td>
        <td>Command</td>
        <td>Response message(String)</td>
        <td>Command to play the music.</td>
    </tr>
    <tr>
        <td><span class="caps">POST</span></td>
        <td>/torrents</td>
        <td>Create</td>
        <td>File link(String)</td>
        <td>Download files from torrent client.</td>
    </tr>
</table>

## Modules used

Some of non standard modules used:

* [express](https://www.npmjs.com/package/mongoose)
* [mongoose](https://www.npmjs.com/package/mongoose)
* [nconf](https://www.npmjs.com/package/nconf)
* [winston](https://www.npmjs.com/package/winston)
* [faker](https://www.npmjs.com/package/faker)


## Author

Created by Sungjung Kim ([@SungjungKim](https://github.com/SungjungKim)).


# Reference

[WebTorrent](https://webtorrent.io/)


# License

The MIT License. Please see [the license file](LICENSE) for more information.
