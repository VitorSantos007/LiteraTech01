import React, { useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { registerRootComponent } from "expo";

// ---------------- Types ----------------
type CategoryKey =
  | "todos"
  | "acao"
  | "comedia"
  | "fabula"
  | "hq"
  | "romance"
  | "terror";

interface Category {
  key: CategoryKey;
  label: string;
}

interface Product {
  id: string;
  titulo: string;
  preco: number;
  categoria: Exclude<CategoryKey, "todos">;
  autor: string;
  editora: string;
  descricao: string;
  imagem: string;
}

interface CartItem {
  id: string;
  titulo: string;
  preco: number;
  imagem: string;
  qtd: number;
}

// ---- Mock Data (troque por API/Assets locais se quiser) ----
const CATEGORIES: Category[] = [
  { key: "todos", label: "Todos" },
  { key: "acao", label: "Ação" },
  { key: "comedia", label: "Comédia" },
  { key: "fabula", label: "Fábula" },
  { key: "hq", label: "HQ" },
  { key: "romance", label: "Romance" },
  { key: "terror", label: "Terror" },
];

const PRODUCTS: Product[] = [
  {
    id: "1",
    titulo: "Amor nas Estrelas",
    preco: 39.9,
    categoria: "romance",
    autor: "Maria Silva",
    editora: "Editora Alfa",
    descricao: "Uma história de amor que atravessa galáxias.",
    imagem:
      "https://images.unsplash.com/photo-1529078155058-5d716f45d604?w=600&q=80",
  },
  {
    id: "2",
    titulo: "A Galinha dos Ovos de Ouro",
    preco: 39.9,
    categoria: "fabula",
    autor: "Autor Clássico",
    editora: "Contos & Fábulas",
    descricao: "Uma fábula sobre ganância e consequências.",
    imagem:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
  },
  {
    id: "3",
    titulo: "A Mandrágora",
    preco: 39.9,
    categoria: "comedia",
    autor: "Nicolau Maquiavel",
    editora: "Teatro Clássico",
    descricao: "Comédia clássica em cinco atos.",
    imagem:
      "https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=600&q=80",
  },
  {
    id: "4",
    titulo: "A Galinha dos Ovos de Ouro",
    preco: 39.9,
    categoria: "fabula",
    autor: "Autor Clássico",
    editora: "Contos & Fábulas",
    descricao: "Uma fábula sobre ganância e consequências.",
    imagem:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
  },
];

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n
  );

function App(): JSX.Element {
  const [categoria, setCategoria] = useState<CategoryKey>("todos");
  const [carrinhoVisivel, setCarrinhoVisivel] = useState<boolean>(false);
  const [detalhes, setDetalhes] = useState<{
    visivel: boolean;
    item: Product | null;
  }>({ visivel: false, item: null });
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);

  const scrollRef = useRef<ScrollView | null>(null);
  const produtosAnchorY = useRef<number>(0);

  const produtosFiltrados: Product[] = useMemo(() => {
    if (categoria === "todos") return PRODUCTS;
    return PRODUCTS.filter((p) => p.categoria === categoria);
  }, [categoria]);

  const total = useMemo(
    () => carrinho.reduce((acc, it) => acc + it.preco * it.qtd, 0),
    [carrinho]
  );

  const qtdeItens = useMemo(
    () => carrinho.reduce((acc, it) => acc + it.qtd, 0),
    [carrinho]
  );

  function irParaProdutos() {
    scrollRef.current?.scrollTo({ y: produtosAnchorY.current, animated: true });
  }

  function abrirDetalhes(item: Product) {
    setDetalhes({ visivel: true, item });
  }

  function fecharDetalhes() {
    setDetalhes({ visivel: false, item: null });
  }

  function adicionarAoCarrinho(item: Product) {
    setCarrinho((atual) => {
      const existe = atual.find((i) => i.id === item.id);
      if (existe) {
        return atual.map((i) => (i.id === item.id ? { ...i, qtd: i.qtd + 1 } : i));
      }
      return [
        ...atual,
        { id: item.id, titulo: item.titulo, preco: item.preco, imagem: item.imagem, qtd: 1 },
      ];
    });
  }

  function alterarQuantidade(id: string, novaQtd: number) {
    setCarrinho((atual) =>
      atual.map((i) => (i.id === id ? { ...i, qtd: Math.max(1, novaQtd) } : i))
    );
  }

  function removerDoCarrinho(id: string) {
    setCarrinho((atual) => atual.filter((i) => i.id !== id));
  }

  function finalizarCompra() {
    if (carrinho.length === 0) {
      Alert.alert("Atenção", "O carrinho está vazio!");
      return;
    }
    Alert.alert("Sucesso", "Compra concluída com sucesso!");
    setCarrinho([]);
    setCarrinhoVisivel(false);
  }

  const renderCategoria = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.chip, categoria === item.key && styles.chipActive]}
      onPress={() => setCategoria(item.key)}
    >
      <Text style={[styles.chipText, categoria === item.key && styles.chipTextActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderProduto = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imagem }} style={styles.capa} />
      <Text style={styles.cardTitulo}>{item.titulo}</Text>
      <Text style={styles.cardPreco}>{formatBRL(item.preco)}</Text>
      <View style={styles.cardButtons}>
        <TouchableOpacity style={styles.btnSec} onPress={() => abrirDetalhes(item)}>
          <Text style={styles.btnSecText}>Ver Detalhes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPri} onPress={() => adicionarAoCarrinho(item)}>
          <Text style={styles.btnPriText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItemCarrinho = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imagem }} style={styles.cartThumb} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cartTitle}>{item.titulo}</Text>
        <Text style={styles.cartPrice}>{formatBRL(item.preco)}</Text>
      </View>
      <View style={styles.qtyBox}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => alterarQuantidade(item.id, item.qtd - 1)}>
          <Text style={styles.qtyBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{item.qtd}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => alterarQuantidade(item.id, item.qtd + 1)}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => removerDoCarrinho(item.id)}>
        <Text style={styles.removeBtnText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Image
              source={{ uri: "https://i.imgur.com/8wQ2n6P.png" }}
              style={styles.logo}
            />
            <Text style={styles.brand}>LiteraTech</Text>
          </View>

          <TouchableOpacity onPress={() => setCarrinhoVisivel(true)} style={styles.cartIconBox}>
            <Image source={{ uri: "https://i.imgur.com/aO2m3iV.png" }} style={styles.cartIcon} />
            {qtdeItens > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{qtdeItens}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80" }}
            style={styles.bannerImg}
          />
          <View style={styles.cta}>
            <Text style={styles.ctaTitle}>Bem-vindo à LiteraTech</Text>
            <Text style={styles.ctaSub}>A sua próxima leitura está a um clique de distância.</Text>
            <TouchableOpacity style={styles.btnPri} onPress={irParaProdutos}>
              <Text style={styles.btnPriText}>Ver Produtos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Produtos */}
        <View
          onLayout={(e) => (produtosAnchorY.current = e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>Nossos Livros</Text>

          {/* Filtro por categoria - chips */}
          <FlatList
            data={CATEGORIES}
            keyExtractor={(i) => i.key}
            renderItem={renderCategoria}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsList}
          />

          {/* Grid de produtos */}
          <FlatList
            data={produtosFiltrados}
            keyExtractor={(i) => i.id}
            renderItem={renderProduto}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            scrollEnabled={false}
          />
        </View>

        {/* Sobre */}
        <View style={[styles.section, styles.sobre]}>
          <Text style={styles.h2}>Sobre</Text>
          <Text style={styles.sobreText}>
            A LiteraTech oferece os melhores livros para todas as idades e estilos. Nosso objetivo é
            promover a leitura e levar conhecimento e entretenimento para nossos clientes através de uma
            seleção cuidadosa de títulos.
          </Text>
        </View>

        {/* Contato */}
        <View style={styles.section}>
          <Text style={styles.h2}>Contato</Text>
          <Text style={styles.contatoText}>Email: literatech@livrariaonline.com</Text>
          <Text style={styles.contatoText}>Telefone: (11) 99999-9999</Text>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 LiteraTech - Todos os direitos reservados.</Text>
        </View>
      </ScrollView>

      {/* Modal Detalhes */}
      <Modal
        transparent
        visible={detalhes.visivel}
        animationType="fade"
        onRequestClose={fecharDetalhes}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.modalClose} onPress={fecharDetalhes}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
            {detalhes.item && (
              <>
                <Text style={styles.modalTitle}>{detalhes.item.titulo}</Text>
                <Text style={styles.modalLine}>Autor: {detalhes.item.autor}</Text>
                <Text style={styles.modalLine}>Editora: {detalhes.item.editora}</Text>
                <Text style={styles.modalLine}>Preço: {formatBRL(detalhes.item.preco)}</Text>
                <Text style={styles.modalDesc}>{detalhes.item.descricao}</Text>
                <TouchableOpacity
                  style={[styles.btnPri, { alignSelf: "flex-start", marginTop: 12 }]}
                  onPress={() => {
                    adicionarAoCarrinho(detalhes.item as Product);
                    fecharDetalhes();
                  }}
                >
                  <Text style={styles.btnPriText}>Adicionar ao Carrinho</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Carrinho */}
      <Modal
        transparent
        visible={carrinhoVisivel}
        animationType="slide"
        onRequestClose={() => setCarrinhoVisivel(false)}
      >
        <View style={styles.cartBackdrop}>
          <View style={styles.cartSheet}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitleTop}>Carrinho</Text>
              <TouchableOpacity onPress={() => setCarrinhoVisivel(false)}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            {carrinho.length === 0 ? (
              <Text style={styles.emptyCart}>Seu carrinho está vazio.</Text>
            ) : (
              <FlatList
                data={carrinho}
                keyExtractor={(i) => i.id}
                renderItem={renderItemCarrinho}
                contentContainerStyle={{ paddingBottom: 12 }}
              />
            )}

            <View style={styles.cartFooter}>
              <Text style={styles.cartTotal}>Total: {formatBRL(total)}</Text>
              <TouchableOpacity style={styles.btnPri} onPress={finalizarCompra}>
                <Text style={styles.btnPriText}>Finalizar Compra</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Registra como entry point (index.tsx)
registerRootComponent(App);
export default App;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fafafa" },
  container: { paddingBottom: 24 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#333",
  },
  logoBox: { flexDirection: "row", alignItems: "center" },
  logo: { width: 32, height: 32, borderRadius: 6, backgroundColor: "#fff" },
  brand: { color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 8 },
  cartIconBox: { position: "relative" },
  cartIcon: { width: 28, height: 28, tintColor: "#fff" },
  badge: {
    position: "absolute",
    right: -8,
    top: -6,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  // Banner
  banner: { margin: 16 },
  bannerImg: { width: "100%", height: 220, borderRadius: 12 },
  cta: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 16,
  },
  ctaTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 6 },
  ctaSub: { color: "#fff", fontSize: 14, marginBottom: 12 },

  // Section
  section: { paddingHorizontal: 16, paddingTop: 8 },
  h2: { fontSize: 22, fontWeight: "700", marginBottom: 12, textAlign: "center" },

  // Chips (filtro)
  chipsList: { paddingVertical: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#ff6600", borderColor: "#ff6600" },
  chipText: { color: "#333", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  // Grid
  grid: { paddingBottom: 12, paddingHorizontal: 16 },
  gridRow: { justifyContent: "space-between" },
  card: {
    width: "48%", // 2 colunas lado a lado com espaçamento
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
    marginBottom: 16,
  },
  capa: { width: 120, height: 180, borderRadius: 6, marginBottom: 10 },
  cardTitulo: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  cardPreco: { color: "#555", marginBottom: 8 },
  cardButtons: { flexDirection: "row" },
  btnPri: {
    backgroundColor: "#ff6600",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  btnPriText: { color: "#fff", fontWeight: "700" },
  btnSec: {
    borderColor: "#ff6600",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  btnSecText: { color: "#ff6600", fontWeight: "700" },

  // Sobre/Contato/Rodapé
  sobre: {
    backgroundColor: "#222",
    paddingVertical: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 16,
  },
  sobreText: {
    color: "#fff",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: 8,
  },
  contatoText: { textAlign: "center", marginBottom: 6 },
  footer: { paddingVertical: 16, alignItems: "center" },
  footerText: { color: "#666" },

  // Modal base
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: { width: 320, backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalClose: { position: "absolute", right: 8, top: 0, padding: 8 },
  modalCloseText: { fontSize: 28, color: "#333" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  modalLine: { marginBottom: 4, color: "#333" },
  modalDesc: { marginTop: 6, color: "#555" },

  // Carrinho (bottom sheet)
  cartBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  cartSheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  cartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cartTitleTop: { fontSize: 18, fontWeight: "700" },
  emptyCart: { textAlign: "center", color: "#666", paddingVertical: 24 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },
  cartThumb: { width: 40, height: 60, borderRadius: 4, marginRight: 8 },
  cartTitle: { fontWeight: "700" },
  cartPrice: { color: "#666" },
  qtyBox: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18 },
  qtyValue: { minWidth: 20, textAlign: "center", marginHorizontal: 8 },
  removeBtn: { backgroundColor: "red", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6 },
  removeBtnText: { color: "#fff", fontWeight: "700" },
  cartFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  cartTotal: { fontSize: 16, fontWeight: "700" },
});