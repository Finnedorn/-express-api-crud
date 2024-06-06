// importo ed inizializzo prisma
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// importo RestErrorFormatter
const RestErrorFormatter = require("../utils/restErrorFormatter");

// funzione di creazione di uno slug unique 
function createUniqueSlug(title) {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  let uniqueSlug = slug;
  let count = 1;
  existingSlugs=[];
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${count}`;
    count++;
  }
  existingSlugs.push(uniqueSlug);
  console.log(uniqueSlug);
  return uniqueSlug;
}

// funzione di creazione di un elemento in db 
const store = async (req, res, next) => {
  const { title, slug, content, published } = req.body;
  // const slug = createUniqueSlug(title);
  try {
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published,
      },
    });
    res.send(`Post creato con successo: ${JSON.stringify(post, null, 2)}`);
  // tramite catch raccolgo l'eventuale errore generato durante la creazione del post
  } catch (error) {
    // storo in una const la nuova istanza di RestErrorFormatter contente lo status e il message da me personlizzato
    const errorFormatter = new RestErrorFormatter(404, `Errore nella creazione del post: ${error}`);
    // passo il tutto che verrà intercettato dal middleware di gestione errori (allErrorFormatter)
    next(errorFormatter);
  }
};

// funzione di recupero di tutti i più elementi dal db, filtrati e paginati 
const index = async (req, res, next) => {
  try {
    // creo una const dove storerò gli elementi
    //  con cui poi effettuerò la ricerca filtrata in prisma
    const where = {};
    // estrapolo dalla query ogni possobile parametro su cui filtrerò
    // imposto un valore di default per page e limit in modo da gestire la paginazione
    // qualora in query non venissero definiti i valori di page e limit
    const { published, content, title, page = 1, limit = 10 } = req.query;

    // controllo gli elementi in query
    // ed ne storo i valori in where 
    if (published === "true") {
      where.published = true;
    } else if (published === "false") {
      where.published = false;
    }

    // se ho del content o del title filtro la ricerca sulla base del loro contenuto
    // es: se la query è "/?title=post" 
    if (content) {
        // equivale a scrivere where: {
        //     content: { contains: content }
        // } 
      where.content = { contains: content };
    }

    if (title) {
      where.title = { contains: title };
    }

    // gestisco la paginazione

    // l'offset è il numero di elementi in array da saltare per raggiungere la pagina corrente
    // lo ottengo dalla pagina corrente (sottraggo 1 per ottenre l'indice di base 0 della pagina corrente)
    // * il numero di elementi in pagina
    const offsetPage = (page - 1) * limit;
    // il numero totale degli elementi da mostrare, varia anche in base al filtro di where
    const totalItems = await prisma.post.count({ where });
    // mostro il numero totale di pagine necessarie a mostrare tutti gli elementi in array
    // dividendo il numero totale di elementi da mostrare / numero di elementi per pagina
    // math ceil arrotonda per eccesso
    const totalPages = Math.ceil(totalItems / limit);

    // take è un parametro di prisma, mi consente di specificare il numero di elementi da recuperare in tabella 
    // skip specifica quante righe della tabella saltare prima di cominciare a recuperare elementi da essa
    const posts = await prisma.post.findMany({ 
        where,
        take: limit,
        skip: offsetPage,
     });
    res.json(
        posts,
        parseInt(page),
        totalPages,
        totalItems,
    );
  } catch (error) {
    const errorFormatter = new RestErrorFormatter(404, `Errore nei parametri passati per la ricerca: ${error}`);
    next(errorFormatter);
  }
};

// funzione di recupero di un elemento singolo tramite slug
const show = async (req, res, next) => {
  try {
    // estraggo lo slug dai params
    const { slug } = req.params;
    const post = await prisma.post.findUnique({
      where: {
        slug,
      },
    });
    // inserisco un nuovo controllo in quanto prisma
    // non ha di per sè un controllo in caso in cui
    // lo slug non corrispondesse ad uno presente in db
    if (slug) {
      res.json(post);
    } else {
      res.status("401").send("errore");
    }
  } catch (error) {
    const errorFormatter = new RestErrorFormatter(404, `Errore nei parametri passati per la ricerca: ${error}`);
    next(errorFormatter);
  }
};

// funzione di update di un elemento selezionato tramite slug
const update = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, content, published } = req.body;
    const post = await prisma.post.update({
      where: {
        slug,
      },
      data: {
        title,
        content,
        published,
      },
    });
    res.send(`Post aggiornato con successo: ${JSON.stringify(post, null, 2)}`);
  } catch {
    const errorFormatter = new RestErrorFormatter(404, `Errore nei parametri passati per l'operazione di update : ${error}`);
    next(errorFormatter);
  }
};

// funzione di delete di un elemento selezionato tramite slug
const destroy = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await prisma.post.delete({
      where: {
        slug,
      },
    });
    res.send("Post eliminato con successo");
  } catch {
    const errorFormatter = new RestErrorFormatter(404, `Errore nei parametri passati l'operazione di delete : ${error}`);
    next(errorFormatter);
  }
};

module.exports = {
  store,
  index,
  show,
  update,
  destroy,
};
