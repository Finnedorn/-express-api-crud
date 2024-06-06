const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function createUniqueSlug(title, existingSlugs) {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  let uniqueSlug = slug;
  let count = 1;
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${count}`;
    count++;
  }
  return uniqueSlug;
}

const store = async (req, res, next) => {
  const { title, slug, content, published } = req.body;
  try {
    // const slug = await createUniqueSlug(title);
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published,
      },
    });
    res.send(`Post creato con successo: ${JSON.stringify(post, null, 2)}`);
  } catch (error) {
    res.status("401").send("errore");
  }
};

const index = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany();
    res.json(posts);
  } catch (error) {
    res.status("401").send("errore");
  }
};

const show = async (req, res, next) => {
  try {
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
    res.status("401").send("errore");
  }
};

const update = async (req, res, next) => {
    try {
        const {slug} = req.params;
        const { title, content, published } = req.body;
        const post = await prisma.post.update({
            where: {
                slug
            },
            data: {
                title,
                content,
                published
            }
        })
        res.send(`Post aggiornato con successo: ${JSON.stringify(post, null, 2)}`);
    } catch {
        res.status("401").send("errore");
    }
};

const destroy = async(req,res, next) => {
    try {
        const {slug} = req.params;
        const post = await prisma.post.delete({
            where: {
                slug
            }
        })
        res.send('Post eliminato con successo')
    } catch {
        res.status("401").send("errore");
    }

}

module.exports = {
  store,
  index,
  show,
  update,
  destroy
};
