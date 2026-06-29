import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string;
}

function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = () => {
      const data: BlogPost[] = [
        {
          id: 1,
          title: "Choosing the Right Sofa for Your Living Room",
          excerpt:
            "A sofa is the centerpiece of your living room. Learn how to pick the perfect sofa that balances comfort, style, and durability for your space.",
          imageUrl:
            "https://images.pexels.com/photos/298842/pexels-photo-298842.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
        {
          id: 2,
          title: "Top Furniture Trends for 2024",
          excerpt:
            "Stay ahead of the curve with the latest furniture trends that are expected to dominate in 2024. From minimalist designs to multifunctional furniture, find out what’s in style.",
          imageUrl:
            "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        },
        {
          id: 3,
          title: "How to Organize Your Home Office Furniture",
          excerpt:
            "A well-organized home office can boost your productivity. Discover how to choose furniture that maximizes space and enhances your work environment.",
          imageUrl:
            "https://images.pexels.com/photos/5546886/pexels-photo-5546886.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
        {
          id: 4,
          title: "Sustainable Furniture: The Future of Home Design",
          excerpt:
            "With a growing focus on sustainability, eco-friendly furniture is becoming more popular. Learn about the materials and designs that contribute to a greener home.",
          imageUrl:
            "https://images.pexels.com/photos/7959554/pexels-photo-7959554.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
        {
          id: 5,
          title: "How to Mix and Match Furniture Styles",
          excerpt:
            "Creating a cohesive interior design with a mix of furniture styles can be challenging. This guide offers tips on blending modern, vintage, and eclectic pieces.",
          imageUrl:
            "https://images.pexels.com/photos/5644354/pexels-photo-5644354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        },
      ];

      setPosts(data);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-vh-100 bg-brown-500 px-4 px-md-5 py-5" style={{ paddingBottom: "120px" }}>
      <h1 className="fs-display-3 text-heading-black fw-bold text-center mb-5">
        Style Your Home <br /> with Expert Furniture Tips and Ideas
      </h1>

      <Container style={{ maxWidth: "896px" }}>
        {posts.length > 0 ? (
          <div className="d-flex flex-column gap-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="flex-row align-items-center gap-4 p-4 rounded-4 shadow-sm border-0"
              >
                <Card.Img
                  src={post.imageUrl}
                  alt={post.title}
                  className="rounded-4"
                  style={{ width: "256px", height: "192px", objectFit: "cover", flexShrink: 0 }}
                  loading="lazy"
                  decoding="async"
                />

                <Card.Body className="p-0 flex-grow-1">
                  <Card.Title as="h2" className="fs-3 fw-semibold text-dark">
                    {post.title}
                  </Card.Title>
                  <Card.Text className="text-secondary mt-2 mb-5">{post.excerpt}</Card.Text>
                  <Card.Text
                    onClick={() => navigate(`/blog/${post.id}`)}
                    className="text-decoration-underline mb-0"
                    role="button"
                    style={{ cursor: "pointer" }}
                  >
                    Read More
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-secondary">No posts available</p>
        )}
      </Container>
    </div>
  );
}

export default Blog;
