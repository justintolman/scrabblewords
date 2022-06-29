const events = require('events');
const fs = require('fs');
const readline = require('readline');
const tree = {};
const ipt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

selectFile();
// generateList();

function selectFile(){
	let langs = fs.readdirSync("../words/", { withFileTypes: true }).filter(dirent => dirent.isDirectory());
	let i;
	for (i in langs) {
		console.log(`${parseInt(i) + 1}) ${langs[i].name}`);
	}

	ipt.question(`Select a language. [1-${parseInt(i) + 1}]: `, function (lang) {
		let path = `../words/${langs[lang-1].name}/`;
		let dicts = fs.readdirSync(path, { withFileTypes: true }).filter(dirent => !dirent.name.includes("-") && dirent.name.slice(-4) === ".txt");
		for (i in dicts) {
			console.log(`${parseInt(i) + 1}) ${dicts[i].name}`);
		}
	  ipt.question(`Select a dictionary. [1-${i + 1}]: `, function (dict) {
			let file_name = dicts[dict-1].name;
		  ipt.question(`Enter a new name for the file. (Optional): `, async function (new_name) {
				await generateTree(path, file_name.slice(0,-4), new_name);
				await generateList();
		    ipt.close();
		  });
	  });
	});
}

ipt.on('close', function () {
  process.exit(0);
});


async function generateTree(path, file_name, new_name) {
	try {
		const rl = readline.createInterface({
			input: fs.createReadStream(`${path + file_name}.txt`),
			crlfDelay: Infinity
		});

		rl.on('line', (line) => {
			let iter = line[Symbol.iterator]();
			let ch = iter.next();
			let branch = tree;
				// console.log(line);
			while (!ch.done && ch.value !== ' '){
				let v = ch.value;
				// console.log(v);
				if(!branch[v]){
					branch[v] = {};
				}
				branch = branch[v];
				ch = iter.next();
			}
			branch['#'] = 1;
		});

		await events.once(rl, 'close');

		fs.writeFileSync(`../trees/${new_name||file_name}.js`, `export default ${JSON.stringify(tree)}`, function (err) {
			if (err) return console.log(err);
			console.log('Tree built.');
		});
		const used = process.memoryUsage().heapUsed / 1024 / 1024;
		console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
	} catch (err) {
		console.error(err);
	}
}

async function generateList() {
		let fileList = fs.readdirSync("../trees/");
		let output = 'export default ['
		console.log(fileList);
		fileList.map(file => {
			if(file.name === "TreeList.js") return false;
			output += `\n\t{ lang: '${file.replace(/_/g,' ').slice(0,-3)}', file: '${file}' },`;
		});
		output += '\n]';

		fs.writeFileSync(`../trees/TreeList.js`, output, function (err) {
			if (err) return console.log(err);
		});
}
