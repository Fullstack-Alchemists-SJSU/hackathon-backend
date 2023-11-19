require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

async function generateEmbeddings(prompts) {
	const model = await use.load();
	const embeddings = await model.embed(prompts);
	return embeddings.arraySync(); // Returns the embedding for the first sentence
}

const Annoy = require('annoy');

async function buildAnnoyIndex(embeddings, embeddingDimension) {
	const index = new Annoy(embeddingDimension, 'Angular');

	embeddings.forEach((embedding, i) => {
		index.addItem(i, embedding);
	});

	index.build(10); // 10 trees
	index.save('test.ann');
	return index;
}

async function findNearestNeighbors(queryEmbedding, n) {
	const embeddingDimension = queryEmbedding.length;
	const index = new Annoy(embeddingDimension, 'Angular');
	index.load('test.ann');

	const nearestNeighbors = index.getNNsByVector(queryEmbedding, n, -1, false);
	index.unload();

	return nearestNeighbors;
}

async function generateAllEmbeddings() {
	prompts = [
		'Economic Sustainability Statements',
		'Social Sustainability Statements',
		'Social Security',
		'Rural Development',
		'How do Farmers benefit from the budget?',
		'What are the economic conditions of the State and Central Government?',
		'How do poor and marginalized communities benefit from the budget?',
		'What are poverty reduction strategies?',
		'How do women and poor children benefit from the Budget?',
		'Poverty Factors',
		'Country Balance of Payments',
		'Weather & Extreme Weather Events',
		'Recessions and Tariffs',
		'What was the fertilizer consumption for 1970 of Australia',
		'Give a fact on Direct Taxes in the budget of 2006-2007',
		'Under PMSSY, How many new Government Medical Colleges will be covered wrt to budget of 2012-13',
		'What will be foreign direct investment changed compared to the budget of 2010 and 2011?',
	];
	const embeddings = generateEmbeddings(prompts);
	console.log('Embeddings : ', embeddings.toString());
	return embeddings;
}

async function main() {
	const question = [
		'What will be foreign direct investment changed compared to the budget of 2010 and 2011?',
		'Economic Sustainability Statements',
		'Economic Sustainability Sentence',
	];
	for (var i = 0; i < 3; i++) {
		const questionEmbedding = await generateEmbedding(question[i]);

		// Assuming `allEmbeddings` is an array of all your pre-generated embeddings
		const allEmbeddings = await generateAllEmbeddings(); // Generate all embeddings and save them to a file

		// Build Annoy Index with all embeddings
		await buildAnnoyIndex(allEmbeddings, questionEmbedding.length);

		// Find nearest neighbors for the new question
		const nearestNeighbors = await findNearestNeighbors(questionEmbedding, 5); // 5 nearest neighbors
		console.log(nearestNeighbors);
	}
}

main();
