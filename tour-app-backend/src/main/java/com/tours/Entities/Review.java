package com.tours.Entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "review")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private Users customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tour_id", referencedColumnName = "id", nullable = false)
    private Tour tour;

    @Column(nullable = false)
    private int rating; // 1 to 5 stars

    @Column(nullable = false, length = 1000)
    private String comment;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
}
