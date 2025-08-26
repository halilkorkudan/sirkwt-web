import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function BlogPanel() {
    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [form, setForm] = useState({
        title: "",
        excerpt: "",
        image: "",
        category: "",
        author: "",
        readTime: "",
        views: 0,
        likes: 0,
        tags: [],
    });

    const editor = useEditor({
        extensions: [StarterKit],
        content: "",
    });

    const fetchPosts = async () => {
        const res = await axios.get("http://localhost:5000/api/posts");
        setPosts(res.data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleOpen = (post = null) => {
        setEditingPost(post);
        if (post) {
            setForm({
                title: post.title,
                excerpt: post.excerpt,
                image: post.image,
                category: post.category,
                author: post.author,
                readTime: post.readTime,
                views: post.views,
                likes: post.likes,
                tags: post.tags.join(","),
            });
            editor.commands.setContent(post.content);
        } else {
            setForm({
                title: "",
                excerpt: "",
                image: "",
                category: "",
                author: "",
                readTime: "",
                views: 0,
                likes: 0,
                tags: [],
            });
            editor.commands.setContent("");
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async () => {
        const payload = { ...form, content: editor.getHTML(), tags: form.tags.split(",") };
        try {
            if (editingPost) {
                await axios.put(`http://localhost:5000/api/posts/${editingPost.id}`, payload);
            } else {
                await axios.post("http://localhost:5000/api/posts", payload);
            }
            fetchPosts();
            handleClose();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu postu silmek istediğinizden emin misiniz?")) {
            await axios.delete(`http://localhost:5000/api/posts/${id}`);
            fetchPosts();
        }
    };

    return (
        <Box p={2}>
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                Yeni Blog Ekle
            </Button>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Başlık</TableCell>
                            <TableCell>Kategori</TableCell>
                            <TableCell>Yazar</TableCell>
                            <TableCell>Tarih</TableCell>
                            <TableCell>İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.map((post) => (
                            <TableRow key={post.id}>
                                <TableCell>{post.title}</TableCell>
                                <TableCell>{post.category}</TableCell>
                                <TableCell>{post.author}</TableCell>
                                <TableCell>{new Date(post.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(post)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(post.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editingPost ? "Blog Düzenle" : "Yeni Blog Ekle"}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Başlık"
                        name="title"
                        fullWidth
                        value={form.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Özet"
                        name="excerpt"
                        fullWidth
                        value={form.excerpt}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Kategori"
                        name="category"
                        fullWidth
                        value={form.category}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Yazar"
                        name="author"
                        fullWidth
                        value={form.author}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Resim URL"
                        name="image"
                        fullWidth
                        value={form.image}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Okuma Süresi"
                        name="readTime"
                        fullWidth
                        value={form.readTime}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Görüntüleme"
                        name="views"
                        type="number"
                        fullWidth
                        value={form.views}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Beğeni"
                        name="likes"
                        type="number"
                        fullWidth
                        value={form.likes}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Etiketler (virgülle ayır)"
                        name="tags"
                        fullWidth
                        value={form.tags}
                        onChange={handleChange}
                    />

                    <Box mt={2}>
                        <EditorContent editor={editor} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
